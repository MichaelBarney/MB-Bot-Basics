process.env.GOOGLE_APPLICATION_CREDENTIALS = "service-account.json";

import VoiceflowService from "../../src/services/VoiceflowService";
import * as admin from "firebase-admin";

admin.initializeApp();
const voiceflowService = new VoiceflowService(admin.firestore());

const telegramUser = {
  username: "tester",
  id: 123,
  is_bot: false,
  first_name: "Test",
};

it("Should be able to restart a voiceflow conversation", async () => {
  const voiceflowResponses = await voiceflowService.sendAction(
    "launch",
    telegramUser
  );
  expect(voiceflowResponses[0].payload.message).toBe("Video de introducao");
});

it("Should be able to send text messages", async () => {
  const voiceflowResponses = await voiceflowService.sendText(
    "Hello World",
    telegramUser
  );
  expect(voiceflowResponses.length).toBeGreaterThan(0);
});
