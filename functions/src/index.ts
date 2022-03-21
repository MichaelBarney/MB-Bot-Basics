import * as functions from "firebase-functions";

import messageProcessors from "./messageProcessors";

import { User } from "telegraf/typings/core/types/typegram";

import VoiceflowService, {
  VoiceflowResponse,
} from "./services/VoiceflowService";
import TelegramService from "./services/TelegramService";

const voiceflowService = new VoiceflowService();
const telegramService = new TelegramService();

export const messageReceived = functions.https.onRequest(
  async (request, response) => {
    await telegramService.bot.handleUpdate(request.body, response);
    response.send();
  }
);

telegramService.bot.on("text", async (ctx) => {
  const { from, text } = ctx.message;
  const responses = await voiceflowService.sendText(text, from);
  await processResponses(responses, from);
});

telegramService.bot.command("/start", async (ctx) => {
  const { from } = ctx;
  const responses = await voiceflowService.sendAction("launch", from);
  await processResponses(responses, from);
});

telegramService.bot.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

telegramService.bot.on("successful_payment", async (ctx) => {
  const { from, successful_payment } = ctx.message;

  const responses = await voiceflowService.sendAction("complete", from);
  await processResponses(responses, from);

  await messageProcessors["paymentComplete"]({
    from,
    payload: successful_payment,
    telegramService,
  });
});

const processResponses = async (responses: VoiceflowResponse[], from: User) => {
  for (const voiceflowResponse of responses) {
    const messageProcessor = messageProcessors[voiceflowResponse.type];
    if (messageProcessor) {
      await messageProcessor({
        from,
        payload: voiceflowResponse.payload,
        telegramService,
      });
    }
  }
};
