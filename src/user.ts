import Debug from "debug";
import axios, { AxiosBasicCredentials, AxiosRequestConfig } from "axios";
import { APP_ID } from "./constants";

import qs = require("qs");
import baseApiClass from "./baseApiClass";
import {
  api_afspraken,
  api_auth_item,
  api_leerling,
  api_schooljaar_item,
} from "./somtoday_api_types";
import Student from "./structures/student";
import { Credentials } from "./structures/organisation";
import Appointment from "./structures/appointment";
import { URLSearchParams } from "url";
import HomeworkAppointment from "./structures/homeworkAppointment";
import HomeworkDate from "./structures/HomeworkDate";
import HomeworkWeek from "./structures/HomeworkWeek";
import SchoolYear from "./structures/schoolYear";
import AppointmentManager from "./managers/AppointmentManager";

const log = Debug("user");

class User extends baseApiClass {
  public accessToken!: string;
  public refreshToken!: string;
  public idToken!: string;
  public somtodayApiUrl!: string;
  public baseURL!: string;
  private _raw_school_year?: SchoolYear;

  public authenticated: Promise<User>;
  private _authenticatedResolver!: (value: User | PromiseLike<User>) => void;
  private _authenticatedRejecter!: (value?: Error | PromiseLike<Error>) => void;
  private _requestInfo: AxiosRequestConfig;
  private _appointmentManager?: AppointmentManager;
  constructor(credentials: Credentials) {
    super(undefined);
    super.setBaseUser = this;
    this._requestInfo = {
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
    log("Initializing user");
    this.authenticated = new Promise((resolve, reject) => {
      this._authenticatedResolver = resolve;
      this._authenticatedRejecter = reject;
    });
    this._fetchInfo().then((user) => {
      this._authenticatedResolver(user);
      this.axiosOptions = {
        method: "get",
        baseURL: `${this.somtodayApiUrl}/rest/v1`,
        headers: { Authorization: `Bearer ${this.accessToken}` },
      };
    });
    this.refreshRefreshToken = this.refreshRefreshToken.bind(this);
  }
  async getStudents(): Promise<Array<Student>> {
    const rawStudents: api_leerling = await this.call({ url: `/leerlingen` });
    const { items } = rawStudents;
    return items.map((rawStudent) => {
      return new Student(this, {
        raw: rawStudent,
      });
    });
  }

  get appointments(): AppointmentManager {
    return this._appointmentManager || new AppointmentManager(this);
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
    for (;;) {
      // TODO: improve speeeeeds
      //  to improve speeds make it make a bunch of promises for like a week or two
      //  and then fetch those at the same time and then remove duplicates and fetch
      //  things that are missing

      const start_date_string = start_date.toISOString().split("T")[0];
      const params = new URLSearchParams();
      params.append("additional", "vak");
      params.append("additional", "docentAfkortingen");
      params.append("additional", "leerlingen");
      params.append("begindatum", start_date_string);
      params.append("einddatum", `${end_date.toISOString().split("T")[0]}`);
      const data: api_afspraken = await this.call({
        url: `/afspraken`,
        params: params,
      });
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

    return filtered_appointments;
  }
  async getHomeworkAppointments(
    startAfterOrOn?: Date,
  ): Promise<Array<HomeworkAppointment>> {
    const params = new URLSearchParams();
    params.set("additional", `swigemaaktVinkjes`);
    params.set("additional", `leerlingen`);
    params.set("additional", `huiswerkgemaakt`);
    const homework: Array<HomeworkAppointment> = await this._getHomework(
      `/studiewijzeritemafspraaktoekenningen`,
      HomeworkAppointment,
      startAfterOrOn,
      params,
    );
    return homework;
  }

  async getHomeworkDates(startAfterOrOn?: Date) {
    const params = new URLSearchParams();
    params.set("additional", `swigemaaktVinkjes`);
    params.set("additional", `leerlingen`);
    const homework: Array<HomeworkAppointment> = await this._getHomework(
      `/studiewijzeritemdagtoekenningen`,
      HomeworkDate,
      startAfterOrOn,
      params,
    );
    return homework;
  }

  async getHomeworkWeeks(startAfterOrOn?: Date, weekNumbers?: number[]) {
    const params = new URLSearchParams();
    function getWeek(date: Date) {
      var onejan = new Date(date.getFullYear(), 0, 1);
      return Math.ceil(
        ((date.valueOf() - onejan.valueOf()) / 86400000 + onejan.getDay() + 1) /
          7,
      );
    }
    startAfterOrOn = startAfterOrOn || new Date(); // TODO: Get start of year
    const endDate = new Date(); // TODO: add week numbers
    /*if (!weekNumbers) {
      const date = startAfterOrOn;
      for (;;) {
        const week1 = getWeek(date);
        date.setDate(date.getDate() + 7);
        if()
      }
    }else{
      weekNumbers?.forEach((number) => {
        params.set("weeknummer", `${number}`);
      });
    }*/
    params.set("additional", `swigemaaktVinkjes`);
    params.set("additional", `leerlingen`);
    this.call();
    // TODO: whats up with this?!
    // How does this work, does it request all?
    // Do you have to add weeknummer for every single week or something?!
  }

  private async _getHomework(
    url: string,
    to_class: typeof HomeworkDate | typeof HomeworkAppointment,
    startAfterOrOn?: Date,
    paramsParam?: URLSearchParams,
  ): Promise<Array<any>> {
    const homeworkAppointments: Array<HomeworkDate | HomeworkAppointment> = [];
    let start_date =
      startAfterOrOn || new Date(Date.now() - 6 * 366 * 24 * 60 * 60 * 1000);

    for (;;) {
      const params = new URLSearchParams(paramsParam);
      params.append(
        "begintNaOfOp",
        `${start_date.toISOString().split("T")[0]}`,
      );
      const data = await this.call({
        url: url,
        params: params,
      });
      const { items } = data;
      items.forEach((item: any) => {
        if (
          !homeworkAppointments.find((find) => find.id === item.links[0].id)
        ) {
          homeworkAppointments.push(new to_class(this, { raw: item }));
        }
        let new_date = new Date(item.datumTijd);
        if (new_date.valueOf() > start_date.valueOf()) {
          start_date = new_date;
        }
      });
      start_date = new Date(start_date.valueOf() - 1.5 * 24 * 60 * 60 * 1000);
      if (items.length < 100) break;
    }
    homeworkAppointments.sort(
      (a, b) => b.dateTime.valueOf() - a.dateTime.valueOf(),
    );
    return homeworkAppointments;
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
