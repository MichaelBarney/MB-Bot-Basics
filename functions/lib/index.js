"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageReceived = void 0;
const functions = require("firebase-functions");
const messageProcessors_1 = require("./messageProcessors");
const VoiceflowService_1 = require("./services/VoiceflowService");
const TelegramService_1 = require("./services/TelegramService");
const voiceflowService = new VoiceflowService_1.default();
const telegramService = new TelegramService_1.default();
exports.messageReceived = functions.https.onRequest(async (request, response) => {
    await telegramService.bot.handleUpdate(request.body, response);
    response.send();
});
telegramService.bot.command("start", async (ctx) => {
    const { from } = ctx;
    const responses = await voiceflowService.sendAction("launch", from);
    await processResponses(responses, from);
});
telegramService.bot.on("text", async (ctx) => {
    const { from, text } = ctx.message;
    const responses = await voiceflowService.sendText(text, from);
    await processResponses(responses, from);
});
telegramService.bot.on("pre_checkout_query", async (ctx) => {
    await ctx.answerPreCheckoutQuery(true);
});
telegramService.bot.on("successful_payment", async (ctx) => {
    const { from, successful_payment } = ctx.message;
    const responses = await voiceflowService.sendAction("complete", from);
    await processResponses(responses, from);
    await messageProcessors_1.default["paymentComplete"]({
        from,
        payload: successful_payment,
        telegramService,
    });
});
const processResponses = async (responses, from) => {
    for (const voiceflowResponse of responses) {
        const messageProcessor = messageProcessors_1.default[voiceflowResponse.type];
        if (messageProcessor) {
            await messageProcessor({
                from,
                payload: voiceflowResponse.payload,
                telegramService,
            });
        }
    }
};
//# sourceMappingURL=index.js.map