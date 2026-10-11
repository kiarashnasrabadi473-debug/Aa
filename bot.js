const express = require("express");
const axios = require("axios");
const { search } = require("duck-duck-scrape");

const app = express();
app.use(express.json());

const TOKEN = "CGFHHF0JYNTOFTRVQSHXDYUIFKDPKFUEMHBZLRWICGBEYYLEUDNVKNDPDUNLDHZF";

// اصلاح آدرس ارسال پیام به سرور اصلی روبیکا
async function sendMessage(chatId, text) {
    try {
        await axios.post(
            `https://botapi.rubika.ir/v3/${TOKEN}/sendMessage`,
            {
                chat_id: chatId,
                text: text
            }
        );
    } catch (err) {
        console.log("خطا در ارسال پیام:", err.message);
    }
}

function calculate(expression) {
    try {
        if (!/^[0-9+\-*/(). ]+$/.test(expression))
            return null;

        return String(eval(expression));
    } catch {
        return "خطا در محاسبه";
    }
}

async function getMeaning(word) {
    try {
        const result = await search(`meaning of ${word}`);
        if (!result.results.length)
            return "معنی پیدا نشد.";

        return result.results[0].description;
    } catch {
        return "خطا در جستجوی معنی.";
    }
}

async function searchWeb(query) {
    try {
        const result = await search(query);
        if (!result.results.length)
            return "چیزی پیدا نکردم.";

        return result.results[0].description;
    } catch {
        return "خطا در جستجوی وب.";
    }
}

// وب‌هوک برای دریافت پیام‌ها از روبیکا
app.post("/webhook", async (req, res) => {
    res.sendStatus(200);

    try {
        const update = req.body.update;

        if (!update?.new_message)
            return;

        const chatId = update.chat_id;
        const text = update.new_message.text || "";

        if (text === "/start") {
            await sendMessage(
                chatId,
                `✅ بات فعال است

دستورات:
ربات سلام
ربات معنی football
ربات رونالدو
ربات 10+20`
            );
            return;
        }

        if (!text.startsWith("ربات"))
            return;

        const question = text.replace(/^ربات\s*/, "").trim();

        if (question === "سلام") {
            await sendMessage(chatId, "سلام 👋");
            return;
        }

        const math = calculate(question);
        if (math !== null) {
            await sendMessage(chatId, `✅ جواب: ${math}`);
            return;
        }

        if (question.startsWith("معنی ")) {
            const word = question.replace("معنی ", "").trim();
            const answer = await getMeaning(word);
            await sendMessage(chatId, answer);
            return;
        }

        const result = await searchWeb(question);
        await sendMessage(chatId, result);

    } catch (err) {
        console.log("خطا در پردازش وب‌هوک:", err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});

