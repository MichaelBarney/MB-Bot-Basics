import { User } from "telegraf/typings/core/types/typegram";
import axios from "axios";
import * as functions from "firebase-functions";

const VOICEFLOW_KEY: string = functions.config().voiceflow.key;
const VOICEFLOW_VERSION: string = functions.config().voiceflow.version;

export interface VoiceflowResponse {
  payload: any;
  type: string;
}

class VoiceflowService {
  async sendAction(action: string, from: User): Promise<VoiceflowResponse[]> {
    const response = await axios({
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

  async sendText(text: string, from: User): Promise<VoiceflowResponse[]> {
    const response = await axios({
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

export default VoiceflowService;
