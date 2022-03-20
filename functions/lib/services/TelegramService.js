"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const functions = require("firebase-functions");
const TELEGRAM_TOKEN = functions.config().telegram.token;
const STRIPE_TEST_KEY = functions.config().stripe.test;
class TelegramService {
    constructor() {
        this.bot = new telegraf_1.Telegraf(TELEGRAM_TOKEN, {
            telegram: { webhookReply: true },
        });
    }
    async sendButtons(options, to, header, placeholder) {
        const id = to.id;
        const buttons = options.map((option) => {
            return [{ text: option, callback_data: option }];
        });
        await this.bot.telegram.sendMessage(id, header !== null && header !== void 0 ? header : "Escolha uma opção:", {
            reply_markup: {
                keyboard: buttons,
                resize_keyboard: true,
                one_time_keyboard: true,
                input_field_placeholder: placeholder !== null && placeholder !== void 0 ? placeholder : options[0],
            },
        });
    }
    async sendText(text, to) {
        const id = to.id;
        await this.bot.telegram.sendMessage(id, text, {
            parse_mode: "Markdown",
        });
    }
    async sendAnimation(url, to) {
        await this.bot.telegram.sendAnimation(to.id, url);
    }
    async sendAudio(url, to) {
        await this.bot.telegram.sendAudio(to.id, url);
    }
    async sendInvoice(to) {
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
        await this.bot.telegram.sendInvoice(to.id, invoice);
    }
}
exports.default = TelegramService;
//# sourceMappingURL=TelegramService.js.map