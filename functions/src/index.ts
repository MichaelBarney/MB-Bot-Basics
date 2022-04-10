import { User } from "telegraf/typings/core/types/typegram";

import * as functions from "firebase-functions";

import messageProcessors from "./messageProcessors";

import * as admin from "firebase-admin";
admin.initializeApp();

import VoiceflowService, {
  VoiceflowResponse,
} from "./services/VoiceflowService";
const voiceflowService = new VoiceflowService(admin.firestore());

import TelegramService from "./services/TelegramService";
const telegramService = new TelegramService();

// Function Endpoint
export const messageReceived = functions.https.onRequest(
  async (request, response) => {
    await telegramService.bot.handleUpdate(request.body, response);
    response.send();
  }
);

// Message handlers
telegramService.bot.command("start", async (ctx) => {
  const { from } = ctx;
  const responses = await voiceflowService.sendAction("launch", from);
  await _processResponses(responses, from);
});

telegramService.bot.on("text", async (ctx) => {
  const { from, text } = ctx.message;
  const responses = await voiceflowService.sendText(text, from);
  await _processResponses(responses, from);
});

telegramService.bot.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

telegramService.bot.on("successful_payment", async (ctx) => {
  const { from, successful_payment } = ctx.message;

  const responses = await voiceflowService.sendAction("complete", from);
  await _processResponses(responses, from);

  await messageProcessors["paymentComplete"]({
    from,
    payload: successful_payment,
    telegramService,
    document: admin.firestore().collection("students").doc(from.id.toString()),
  });
});

// Message processor dispatcher
const _processResponses = async (
  responses: VoiceflowResponse[],
  from: User
) => {
  for (const voiceflowResponse of responses) {
    const messageProcessor = messageProcessors[voiceflowResponse.type];
    if (messageProcessor) {
      await messageProcessor({
        from,
        payload: voiceflowResponse.payload,
        telegramService,
        document: admin
          .firestore()
          .collection("students")
          .doc(from.id.toString()),
      });
    }
  }
};
