const axios = require('axios');
const {
    chromium
} = require('playwright');

const token = "8496844359:AAHnmQhDqj641wSTI19NOPm0Mdn5fTZYR3U";
const chatId = "5625039569";

async function sendTelegram(message) {
    if (!token || !chatId) return;
    const now = new Date();
    const hkTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const timeStr = hkTime.toISOString().replace('T', ' ').substr(0, 19) + " HKT";
    const fullMessage = `🎉 Netlib 登录通知\n\n登录时间：${timeStr}\n\n${message}`;
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: fullMessage
        }, {
            timeout: 10000
        });
        console.log('✅ Telegram 通知发送成功');
    } catch (e) {
        console.log('⚠️ Telegram 发送失败');
    }
}

async function loginWithAccount() {
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    let page;
    let result = "";
    try {
        page = await browser.newPage();
        page.setDefaultTimeout(30000);
        // await page.context().clearCookies();
        // await page.evaluate(() => localStorage.clear());
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
        await page.goto('https://bbs.binmt.cc/member.php?mod=logging&action=login&mobile=2', {
            waitUntil: 'networkidle'
        });
        await page.waitForTimeout(3000);
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
