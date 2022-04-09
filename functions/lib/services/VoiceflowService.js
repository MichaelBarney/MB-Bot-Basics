"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const functions = require("firebase-functions");
const VOICEFLOW_KEYS = functions.config().voiceflow.keys;
class VoiceflowService {
    async sendAction(action, from) {
        const languageCode = from.language_code == "en" ? from.language_code : "pt";
        const response = await (0, axios_1.default)({
            method: "POST",
            baseURL: "https://general-runtime.voiceflow.com",
            url: `/state/user/${from.username}/interact`,
            headers: {
                Authorization: VOICEFLOW_KEYS[languageCode],
            },
            data: {
                action: {
                    type: action,
                },
            },
        });
        return response.data;
    }
    async sendText(text, from) {
        const languageCode = from.language_code === "en" ? from.language_code : "pt";
        const response = await (0, axios_1.default)({
            method: "POST",
            baseURL: "https://general-runtime.voiceflow.com",
            url: `/state/user/${from.username}/interact`,
            headers: {
                Authorization: VOICEFLOW_KEYS[languageCode],
            },
            data: {
                action: {
                    type: "text",
                    payload: text,
                },
                config: {
                    stopTypes: ["pay"],
                },
            },
        });
        return response.data;
    }
}
exports.default = VoiceflowService;
//# sourceMappingURL=VoiceflowService.js.map