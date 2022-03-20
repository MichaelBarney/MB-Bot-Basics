"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const functions = require("firebase-functions");
const VOICEFLOW_KEY = functions.config().voiceflow.key;
const VOICEFLOW_VERSION = functions.config().voiceflow.version;
class VoiceflowService {
    async sendAction(action, from) {
        const response = await (0, axios_1.default)({
            method: "POST",
            baseURL: "https://general-runtime.voiceflow.com",
            url: `/state/${VOICEFLOW_VERSION}/user/${from.username}/interact`,
            headers: {
                Authorization: VOICEFLOW_KEY,
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
        const response = await (0, axios_1.default)({
            method: "POST",
            baseURL: "https://general-runtime.voiceflow.com",
            url: `/state/${VOICEFLOW_VERSION}/user/${from.username}/interact`,
            headers: {
                Authorization: VOICEFLOW_KEY,
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