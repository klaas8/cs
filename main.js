const axios = require("axios");
const {
    chromium
} = require("playwright");

let browser;
const phone = "18177053882";

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

async function main() {
    browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const result = await s1();
    await browser.close();
}

main().catch(console.error);