import Debug from "debug";
import axios, { AxiosBasicCredentials, AxiosRequestConfig } from "axios";
import { APP_ID } from "./constants";

import qs = require("qs");
import baseApiClass from "./baseApiClass";
import { api_auth_item, api_leerling } from "./somtoday_api_types";
import Student from "./structures/student";
import { Credentials } from "./structures/organisation";
import SchoolYear from "./structures/schoolYear";
import AppointmentManager from "./managers/AppointmentManager";
import HomeworkManager from "./managers/HomeworkManager";
import SchoolYearManager from "./managers/SchoolYearManager";
import endpoints from "./endpoints";

const log = Debug("user");

class User extends baseApiClass {
  public accessToken!: string;
  public refreshToken!: string;
  public idToken!: string;
  public somtodayApiUrl!: string;
  public baseURL!: string;

  public authenticated: Promise<User>;
  private _authenticatedResolver!: (value: User | PromiseLike<User>) => void;
  private _authenticatedRejecter!: (value?: Error | PromiseLike<Error>) => void;

  private _appointmentManager?: AppointmentManager;
  private _homeworkManager?: HomeworkManager;
  private _schoolYearManager?: SchoolYearManager;
  constructor(credentials: Credentials | string) {
    super();
    super.setBaseUser = this;
    log("Initializing user");
    this.authenticated = new Promise((resolve, reject) => {
      this._authenticatedResolver = resolve;
      this._authenticatedRejecter = reject;
    });

    if (typeof credentials == "string") {
      this.refreshRefreshToken(credentials).then((res) => {
        if (res) {
          this._authenticatedResolver(this);
        } else {
          throw new Error("Your refresh token was invalid");
        }
      });
    } else {
      const requestInfo: AxiosRequestConfig = {
        method: "POST",
        baseURL: `https://somtoday.nl/oauth2/token`,
        data: qs.stringify({
          grant_type: "password",
          username: `${credentials.organization}\\${credentials.username}`,
          password: credentials.password,
          scope: "openid",
          client_id: APP_ID,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }),
      };
      log("Fetching auth info");
      axios
        .request(requestInfo)
        .then((res) => res.data)
        .then((data: api_auth_item) => {
          this._storeInfo(data);
          this._authenticatedResolver(this);
          this.axiosOptions = {
            method: "get",
            baseURL: `${this.somtodayApiUrl}` + endpoints.baseURL,
            headers: { Authorization: `Bearer ${this.accessToken}` },
          };
        });
    }
    this.refreshRefreshToken = this.refreshRefreshToken.bind(this);
  }
  async getStudents(): Promise<Array<Student>> {
    const rawStudents: api_leerling = await this.call({
      url: `/leerlingen`,
      method: "GET",
    });
    const { items } = rawStudents;
    return items.map((rawStudent) => {
      return new Student(this, {
        raw: rawStudent,
      });
    });
  }

  get appointmentsManager(): AppointmentManager {
    return (
      this._appointmentManager ||
      (this._appointmentManager = new AppointmentManager(this))
    );
  }

  get schoolYearManager(): SchoolYearManager {
    return this._schoolYearManager || new SchoolYearManager(this);
  }

  get homeworkManager(): HomeworkManager {
    return this._homeworkManager || new HomeworkManager(this);
  }

  public async refreshRefreshToken(
    refreshToken?: string,
  ): Promise<boolean | void> {
    log("Token expired");
    log("Refreshing user token");
    const body = {
      grant_type: "refresh_token",
      refresh_token: refreshToken || this.refreshToken,
      client_id: APP_ID,
    };

    return axios
      .post("https://somtoday.nl/oauth2/token", qs.stringify(body), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((authResponse) => {
        const { data }: { data: api_auth_item } = authResponse;
        this._storeInfo(data);
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
          console.error(e);
          return false;
        }
      });
  }

  private _storeInfo(authInfo: api_auth_item): User {
    this.accessToken = authInfo.access_token;
    this.refreshToken = authInfo.refresh_token;
    this.idToken = authInfo.id_token;
    this.somtodayApiUrl = authInfo.somtoday_api_url;
    this.baseURL = `${authInfo.somtoday_api_url}` + endpoints.baseURL;
    return this;
  }

  toObject() {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      idToken: this.idToken,
      somtodayApiUrl: this.somtodayApiUrl,
      baseURL: this.baseURL,
    };
  }
}

export { User as default };
