import axios from "axios";
import User from "./user";
import { APP_ID, APP_SECRET, BASE64_AUTH } from "./constants";
import qs = require("qs");

interface Credentials {
  username: string;
  password: string;
}

class Organization {
  constructor(
    public uuid: string,
    public name: string,
    public location: string,
  ) {
    // do nothing
  }

  async authenticate(credentials: Credentials) {
    if (credentials.username.trim().length === 0) {
      throw new Error("No username provided");
    } else if (credentials.password.trim().length === 0) {
      throw new Error("No password provided");
    }

    const body = {
      grant_type: "password",
      username: `${this.uuid}\\${credentials.username}`,
      password: credentials.password,
      scope: "openid",
      client_id: APP_ID,
    };

    return axios
      .post("https://production.somtoday.nl/oauth2/token", qs.stringify(body), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((authResponse) => {
        const { data } = authResponse;
        return new User(
          data.access_token,
          data.refresh_token,
          data.id_token,
          data.somtoday_api_url,
        );
      });
  }
}

export { Organization as default };
