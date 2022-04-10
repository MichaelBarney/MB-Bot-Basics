"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const functions = require("firebase-functions");
const STRIPE_TEST_KEY = functions.config().stripe.test;
const isEmulated = process.env.FUNCTIONS_EMULATOR === "true";
const TELEGRAM_TOKEN = isEmulated
    ? functions.config().telegram.tokens.test
    : functions.config().telegram.tokens.prod;
class TelegramService {
    constructor() {
        this.bot = new telegraf_1.Telegraf(TELEGRAM_TOKEN, {
            telegram: { webhookReply: true },
        });
    }
    async sendText(text, to, botMock) {
        const id = to.id;
        const usableBot = botMock || this.bot;
        await usableBot.telegram.sendMessage(id, text, {
            parse_mode: "Markdown",
        });
    }
    async sendButtons(options, to, header, placeholder, botMock) {
        const id = to.id;
        const buttons = options.map((option) => {
            return [{ text: option, callback_data: option }];
        });
        const usableBot = botMock || this.bot;
        await usableBot.telegram.sendMessage(id, header !== null && header !== void 0 ? header : "Escolha uma opção:", {
            reply_markup: {
                keyboard: buttons,
                resize_keyboard: true,
                one_time_keyboard: true,
                input_field_placeholder: placeholder !== null && placeholder !== void 0 ? placeholder : options[0],
            },
        });
    }
    async sendAnimation(url, to) {
        await this.bot.telegram.sendAnimation(to.id, url);
    }
    async sendAudio(url, to) {
        await this.bot.telegram.sendAudio(to.id, url);
    }
    async sendInvoice(to, botMock) {
        const invoice = {
            chat_id: to.id,
            provider_token: STRIPE_TEST_KEY,
            start_parameter: "pagar",
            title: "Certificação",
            description: "Emita um certificado de conclusão ao terminar o curso",
            currency: "BRL",
            prices: [
                {
                    label: "Certificação",
                    amount: 2000,
                },
            ],
            payload: String(to.id + Date.now()),
        };
        const usableBot = botMock || this.bot;
        await usableBot.telegram.sendInvoice(to.id, invoice);
    }
}
exports.default = TelegramService;
//# sourceMappingURL=TelegramService.js.map