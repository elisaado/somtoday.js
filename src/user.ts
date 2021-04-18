import { EventEmitter } from "events";
import Debug from "debug";
import axios, { AxiosBasicCredentials, AxiosRequestConfig } from "axios";
import { APP_ID, APP_SECRET } from "./constants";
import { InvalidTokenError } from "./errors";
import Grade from "./grade";
import Course from "./course";

import qs = require("qs");
import baseApiClass from "./baseApiClass";
import {
  api_auth_item,
  api_cijfer,
  api_leerling,
  geslacht,
} from "./somtoday_api_types";
import Student from "./student";
import { Credentials } from "./organisation";

const log = Debug("user");

class User {
  public accessToken!: string;
  public refreshToken!: string;
  public idToken!: string;
  public somtodayApiUrl!: string;
  public baseURL!: string;

  public authenticated: Promise<User>;
  private _authenticatedResolver!: (value: User | PromiseLike<User>) => void;
  private _authenticatedRejecter!: (value?: Error | PromiseLike<Error>) => void;
  private _requestInfo: AxiosRequestConfig;
  constructor(credentials: Credentials) {
    log("Initializing user");
    this._requestInfo = {
      method: "POST",
      baseURL: `https://production.somtoday.nl/oauth2/token`,
      data: {
        grant_type: "password",
        username: `${credentials.organization}\\${credentials.username}`,
        password: credentials.password,
        scope: "openid",
        client_id: APP_ID,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    this.authenticated = new Promise((resolve, reject) => {
      this._authenticatedResolver = resolve;
      this._authenticatedRejecter = reject;
    });
    this._fetchInfo().then((user) => {
      this._authenticatedResolver(user);
    });
    this._refreshToken = this._refreshToken.bind(this);
  }
  async getStudents(): Promise<Array<Student>> {
    const rawStudents: api_leerling = await axios
      .request({
        method: "get",
        url: `/leerlingen`,
        baseURL: `${this.somtodayApiUrl}/rest/v1`,
        headers: { Authorization: `Bearer ${this.accessToken}` },
      })
      .then((res) => res.data);

    const { items } = rawStudents;
    return items.map((rawStudent) => {
      return new Student(this, {
        raw: rawStudent,
      });
    });
  }
  private async _refreshToken(refreshToken: string): Promise<boolean | void> {
    log("Token expired");
    log("Refreshing user token");
    const body = {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
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
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.idToken = data.id_token;
        //this.emit("token_refreshed");

        return true;
      })
      .catch((e) => {
        if (
          e.response.data.error === "invalid_grant" ||
          (e.response.data.error === "access_denied" &&
            e.response.data.error_description ===
              "Access denied by resource owner or authorization server: Unauthorized account")
        ) {
          log("Unable to refresh token");
          // TODO: make this better
          this._authenticatedRejecter(new InvalidTokenError());
        }
      });
  }
  private async _fetchInfo(): Promise<User> {
    log("Fetching auth info");
    return axios
      .request(this._requestInfo)
      .then((res) => res.data)
      .then((data: api_auth_item) => {
        return this._storeInfo(data);
      });
  }
  private _storeInfo(authInfo: api_auth_item): User {
    this.accessToken = authInfo.access_token;
    this.refreshToken = authInfo.refresh_token;
    this.idToken = authInfo.id_token;
    this.somtodayApiUrl = authInfo.somtoday_api_url;
    this.baseURL = `${authInfo.somtoday_api_url}/rest/v1`;
    return this;
  }
}

export { User as default };
