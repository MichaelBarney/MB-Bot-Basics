// import * as functions from "firebase-functions-test";
import VoiceflowService from "../../src/services/VoiceflowService";
const voiceflowService = new VoiceflowService();

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
