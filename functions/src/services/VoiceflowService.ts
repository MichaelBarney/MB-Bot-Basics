import { User } from "telegraf/typings/core/types/typegram";
import axios from "axios";
import * as functions from "firebase-functions";

const VOICEFLOW_KEYS: any = functions.config().voiceflow.keys;

export interface VoiceflowResponse {
  payload: any;
  type: string;
}

export interface State {
  stack: any[];
  storage: any[];
  variables: any[];
}

class VoiceflowService {
  db: FirebaseFirestore.Firestore;

  constructor(db: FirebaseFirestore.Firestore) {
    this.db = db;
  }

  async sendAction(action: string, user: User): Promise<VoiceflowResponse[]> {
    const languageCode = user.language_code == "en" ? user.language_code : "pt";
    const state = await this.getState(user);
    const response = await axios({
      method: "POST",
      baseURL: "https://general-runtime.voiceflow.com",
      url: `/interact`,
      headers: {
        Authorization: VOICEFLOW_KEYS[languageCode],
      },
      data: {
        action: {
          type: action,
        },
        state: state || {},
      },
    });
    await this.setState(user, response.data.state);
    return response.data.trace;
  }

  async sendText(text: string, user: User): Promise<VoiceflowResponse[]> {
    const languageCode =
      user.language_code === "en" ? user.language_code : "pt";

    const state = await this.getState(user);
    const response = await axios({
      method: "POST",
      baseURL: "https://general-runtime.voiceflow.com",
      url: `/interact`,
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
        state: state || {},
      },
    });
    await this.setState(user, response.data.state);
    return response.data.trace;
  }

  async setState(of: User, state: State) {
    await this.db.collection("students").doc(String(of.id)).update({
      state,
    });
  }

  async getState(of: User): Promise<State> {
    const userData = (
      await this.db.collection("students").doc(String(of.id)).get()
    ).data();
    return userData?.state;
  }
}

export default VoiceflowService;
