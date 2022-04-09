import { User } from "telegraf/typings/core/types/typegram";
import axios from "axios";
import * as functions from "firebase-functions";

const VOICEFLOW_KEYS: any = functions.config().voiceflow.keys;

export interface VoiceflowResponse {
  payload: any;
  type: string;
}

class VoiceflowService {
  async sendAction(action: string, from: User): Promise<VoiceflowResponse[]> {
    const languageCode = from.language_code == "en" ? from.language_code : "pt";
    const response = await axios({
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

  async sendText(text: string, from: User): Promise<VoiceflowResponse[]> {
    const languageCode =
      from.language_code === "en" ? from.language_code : "pt";

    const response = await axios({
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

export default VoiceflowService;
