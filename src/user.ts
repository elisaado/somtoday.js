// @ts-nocheck
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
      (async () => {
        const https = require('https');
        let nothing = () => { };
        let [a, cookie] = await new Promise((resolve, reject) => https.get(`https://inloggen.somtoday.nl/oauth2/authorize?redirect_uri=somtodayleerling%3A%2F%2Foauth%2Fcallback&client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2&response_type=code&prompt=login&scope=openid&tenant_uuid=${credentials.organization}&session=no_session`, (r) => resolve(nothing(r.on('data', () => { })) ?? [r.headers.location.split('?auth=')[1], r.headers['set-cookie'][0].split(';')[0]])));
        let cookie2 = await new Promise((resolve, reject) => https.get(`https://inloggen.somtoday.nl/?auth=${a}`, { headers: { "Cookie": cookie } }, (r) => resolve(nothing(r.on('data', () => { })) ?? r.headers['set-cookie']?.[0]?.split(';')?.[0] ?? false)));

        let c, d, r;
        if (cookie2 !== false) {
          let b1 = await new Promise((resolve, reject) => (r = https.request(`https://inloggen.somtoday.nl/?0-1.-panel-signInForm&auth=${a}`, { method: "POST", headers: { 'Origin': 'https://inloggen.somtoday.nl', 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': cookie + "; " + cookie2 } }, (r) => r.on('data', (b) => { }).on('end', () => resolve())), r.end(`loginLink=x&usernameFieldPanel%3AusernameFieldPanel_body%3AusernameField=${encodeURIComponent(credentials.username)}`)));
          try {
            let b2 = await new Promise((resolve, reject) => (r = https.request(`https://inloggen.somtoday.nl/login?2-1.-passwordForm`, { method: "POST", headers: { 'Origin': 'https://inloggen.somtoday.nl', 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': cookie + "; " + cookie2 } }, (r) => r.on('data', (b) => { }).on('end', () => resolve(r.headers.location.split('/callback?code=')[1].split("&")[0]))), r.end(`loginLink=x&passwordFieldPanel%3ApasswordFieldPanel_body%3ApasswordField=${encodeURIComponent(credentials.password)}`)));
          } catch (e) {
              if (e instanceof TypeError) {
                throw new Error("Invalid Username");
              }
          }
          c = await new Promise((resolve, reject) => (d = '', r = https.request(`https://inloggen.somtoday.nl/oauth2/token`, { method: "POST", headers: { 'Content-Type': 'application/x-www-form-urlencoded', } }, (r) => r.on('data', (b) => d += b).on('end', () => resolve(d))), r.end(`code=${b2}&grant_type=authorization_code&client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2`)));
        } else {
          let b = await new Promise((resolve, reject) => (r = https.request(`https://inloggen.somtoday.nl/?-1.-panel-signInForm&auth=${a}`, { method: "POST", headers: { 'Origin': 'https://inloggen.somtoday.nl', 'Content-Type': 'application/x-www-form-urlencoded', } }, (r) => r.on('data', (b) => { }).on('end', () => resolve(r.headers.location.split('/callback?code=')[1].split("&")[0]))), r.end(`loginLink=x&usernameFieldPanel%3AusernameFieldPanel_body%3AusernameField=${encodeURIComponent(credentials.username)}&passwordFieldPanel%3ApasswordFieldPanel_body%3ApasswordField=${encodeURIComponent(credentials.password)}`)));
          c = await new Promise((resolve, reject) => (d = '', r = https.request(`https://inloggen.somtoday.nl/oauth2/token`, { method: "POST", headers: { 'Content-Type': 'application/x-www-form-urlencoded', } }, (r) => r.on('data', (b) => d += b).on('end', () => resolve(d))), r.end(`code=${b}&grant_type=authorization_code&client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2`)));
        }
        this._storeInfo(JSON.parse(c));
        this._authenticatedResolver(this);
        this.axiosOptions = {
          method: "get",
          baseURL: `${this.somtodayApiUrl}` + endpoints.baseURL,
          headers: { Authorization: `Bearer ${this.accessToken}` },
        };
      })();
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
        const { data }: { data: api_auth_item; } = authResponse;
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
