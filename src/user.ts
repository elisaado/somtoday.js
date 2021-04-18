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
  api_afspraken,
  api_auth_item,
  api_cijfer,
  api_leerling,
  geslacht,
} from "./somtoday_api_types";
import Student from "./student";
import { Credentials } from "./organisation";
import Appointment from "./appointment";
import { URLSearchParams } from "url";

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
      data: qs.stringify({
        grant_type: "password",
        username: `${credentials.organization}\\${credentials.username}`,
        password: credentials.password,
        scope: "openid",
        client_id: APP_ID,
      }),
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
    this.refreshRefreshToken = this.refreshRefreshToken.bind(this);
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
  async getAppointments(
    startDate?: Date,
    endDate?: Date,
  ): Promise<Array<Appointment>> {
    const appointments: Array<Appointment> = [];
    let start_date =
      startDate || new Date(Date.now() - 6 * 366 * 24 * 60 * 60 * 1000);
    const end_date =
      endDate || new Date(Date.now() + 6 * 366 * 24 * 60 * 60 * 1000);
    // do this until there are no more grades
    console.time("appointments");
    for (;;) {
      // TODO: improve speeeeeds
      //  to improve speeds make it make a bunch of promises for like a week or two
      //  and then fetch those at the same time and then remove duplicates and fetch
      //  things that are missing

      const start_date_string = start_date.toISOString().split("T")[0];
      console.timeLog("appointments", start_date_string);
      const params = new URLSearchParams();
      params.append("additional", "vak");
      params.append("additional", "docentAfkortingen");
      params.append("additional", "leerlingen");
      params.append("begindatum", start_date_string);
      params.append("einddatum", `${end_date.toISOString().split("T")[0]}`);
      const res = await axios.request({
        method: "get",
        baseURL: `${this.somtodayApiUrl}/rest/v1`,
        headers: { Authorization: `Bearer ${this.accessToken}` },
        url: `/afspraken`,
        params: params,
      });
      console.timeLog("appointments", start_date_string + " after request");
      const data: api_afspraken = res.data;
      const { items } = data;
      items.forEach((appointment) => {
        const newAppointment = new Appointment(this, {
          raw: appointment,
        });
        appointments.push(newAppointment);
        if (newAppointment.startDateTime.valueOf() > start_date.valueOf()) {
          start_date = newAppointment.startDateTime;
        }
        start_date = new Date(start_date.valueOf() - 50 * 60 * 60 * 1000);
      });

      if (data.items.length < 100) break;
    }
    console.timeEnd("appointments");
    console.time("sort");
    const filtered_appointments = appointments.filter(
      (appointment, index, array) => {
        if (array.filter((find) => find.id === appointment.id)?.length > 1) {
          return false;
        }
        return true;
      },
    );

    filtered_appointments.sort(
      (a, b) => b.startDateTime.valueOf() - a.startDateTime.valueOf(),
    );
    console.timeEnd("sort");
    return filtered_appointments;
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
