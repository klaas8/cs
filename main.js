const axios = require("axios");
const {
    chromium
} = require("playwright");

const token = "8496844359:AAHnmQhDqj641wSTI19NOPm0Mdn5fTZYR3U";
const chatId = "5625039569";

async function sendTelegram(message) {
    if (!token || !chatId) return;
    const now = new Date();
    const hkTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const timeStr = hkTime.toISOString().replace("T", " ").substr(0, 19) + " HKT";
    const fullMessage = `🎉 Netlib 运行通知\n\n运行时间：${timeStr}\n\n${message}`;
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

async function loginWithAccount() {
    const browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    let page;
    let result = "";
    try {
        page = await browser.newPage();
        page.setDefaultTimeout(30000);
        await page.goto("https://wappass.baidu.com/passport/login?u=https://fanyi.baidu.com/m/profile#/sms_login_new", {
            waitUntil: "networkidle"
        });
        await page.waitForTimeout(3000);
        console.log("输入手机号");
        await page.fill('input[type="tel"][input-type="all"]', "18177053882");
        await page.waitForTimeout(1000);
        console.log("勾选协议");
        await page.click('button[role="checkbox"]');
        await page.waitForTimeout(1000);
        console.log("提交...");
        await page.click('button[disabled="disabled"]');
        result = await page.content();
        console.log(result);
    } catch (e) {} finally {
        if (page) await page.close();
        await browser.close();
    }
    return result;
}

async function main() {
    const result = await loginWithAccount();
    await sendTelegram(result.length);
}

main().catch(console.error);