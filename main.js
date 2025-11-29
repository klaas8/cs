const axios = require("axios");
const {
    chromium
} = require("playwright");

const token = "8496844359:AAHnmQhDqj641wSTI19NOPm0Mdn5fTZYR3U";
const chatId = "5625039569";
let browser;
const phone = "18177053882";

async function sendTelegram(message) {
    if (!token || !chatId) return;
    const now = new Date();
    const hkTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const timeStr = hkTime.toISOString().replace("T", " ").substr(0, 19) + " HKT";
    const fullMessage = `🎉 测压运行通知\n\n运行时间：${timeStr}\n\n${message}`;
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: fullMessage
        }, {
            timeout: 10000
        });
        console.log("✅ Telegram 通知发送成功");
    } catch (e) {
        console.log("⚠️ Telegram 发送失败");
    }
}

// 百度翻译
async function s1() {
    let page;
    let result = "百度翻译: fail";
    try {
        page = await browser.newPage();
        page.setDefaultTimeout(30000);
        await page.goto("https://wappass.baidu.com/passport/login?u=https://fanyi.baidu.com/m/profile#/sms_login_new", {
            waitUntil: "networkidle"
        });
        await page.waitForTimeout(3000);
        const inputSelector = 'input[type="tel"][input-type="all"]';
        const isInputExists = await page.waitForSelector(inputSelector, {
            timeout: 5000,
            state: 'visible'
        }).then(() => true).catch(() => false);
        if (!isInputExists) {
            console.log("未找到手机号输入框");
            return result;
        }
        await page.fill(inputSelector, phone);
        const inputValue = await page.$eval(inputSelector, input => input.value);
        console.log("输入框值:", inputValue);

        const buttonSelector = 'button[role="checkbox"]';
        const isButtonExists = await page.waitForSelector(buttonSelector, {
            timeout: 5000,
            state: 'visible'
        }).then(() => true).catch(() => false);
        if (!isButtonExists) {
            console.log("未找到协议");
            return result;
        }
        await page.click(buttonSelector);
        await page.waitForTimeout(1000);
        const afterClick = await page.getAttribute(buttonSelector, 'aria-checked');
        if (afterClick === 'true') {
            console.log("协议按钮已成功选中");
        } else {
            console.log("协议按钮未选中");
            return result;
        }

        const smsLoginSelectors = [
            'button:has-text("验证码登录")',
            'button:has-text("短信登录")'
        ];

        for (const selector of smsLoginSelectors) {
            try {
                const isSmsButtonExists = await page.waitForSelector(selector, {
                    timeout: 2000,
                    state: 'visible'
                }).then(() => true).catch(() => false);
                if (isSmsButtonExists) {
                    await page.click(selector);
                    await page.waitForTimeout(2000);
                    console.log("成功点击验证码登录按钮");
                    result = "百度翻译: success";
                    break;
                }
            } catch (e) {
                continue;
            }
        }
    } catch (e) {} finally {
        if (page) await page.close();
    }
    return result;
}

// 新百易教师
async function s2() {
    let page;
    let result = "新百易教师: fail";
    try {
        page = await browser.newPage();
        page.setDefaultTimeout(30000);
        await page.goto("https://www.jszg.com/m/short_message", {
            waitUntil: "networkidle"
        });
        await page.waitForTimeout(3000);
        
        const inputSelector = 'input[type="text"][name="phone"]';
        const isInputExists = await page.waitForSelector(inputSelector, {
            timeout: 5000,
            state: 'visible'
        }).then(() => true).catch(() => false);
        if (!isInputExists) {
            console.log("未找到手机号输入框");
            return result;
        }
        await page.fill(inputSelector, "18177053882");
        const inputValue = await page.$eval(inputSelector, input => input.value);
        console.log("输入框值:", inputValue);
        
        const result2 = await page.content();
        console.log(result2);
    } catch (e) {} finally {
        if (page) await page.close();
        await browser.close();
    }
    return result;
}

async function main() {
    browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const result = await s1();
    //const result2 = await s2();
    await sendTelegram(`${result}`);
    await browser.close();
}

main().catch(console.error);