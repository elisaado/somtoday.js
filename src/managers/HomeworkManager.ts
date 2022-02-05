import Collection from "@discordjs/collection";
import { URLSearchParams } from "url";
import baseApiClass from "../baseApiClass";
import endpoints from "../endpoints";
import {
  api_huiswerk_datum,
  api_huiswerk_datum_item,
  api_huiswerk_studiewijzer,
  api_huiswerk_studiewijzer_item,
  api_huiswerk_week,
} from "../somtoday_api_types";
import Appointment from "../structures/appointment";
import HomeworkAppointment from "../structures/homeworkAppointment";
import HomeworkDate from "../structures/homeworkDate";
import HomeworkWeek from "../structures/homeworkWeek";
import User from "../user";

export default class HomeworkManager extends baseApiClass {
  public appointmentCache: Collection<number, HomeworkAppointment>;
  public dateCache: Collection<number, HomeworkDate>;
  public weekCache: Collection<number, HomeworkWeek>;
  constructor(private _user: User) {
    super(_user, {
      method: "get",
      baseURL: _user.baseURL,
      headers: { Authorization: `Bearer ${_user.accessToken}` },
    });
    this.appointmentCache = new Collection();
    this.dateCache = new Collection();
    this.weekCache = new Collection();
  }

  async fetchHomeworkAppointments(
    startAfterOrOn?: Date,
  ): Promise<Collection<number, HomeworkAppointment>> {
    const params = new URLSearchParams();
    params.append("additional", `swigemaaktVinkjes`);
    params.append("additional", `leerlingen`);
    params.append("additional", `huiswerkgemaakt`);
    const res = await this._fetchManyHomework(
      endpoints.homeworkAppointment,
      HomeworkAppointment,
      startAfterOrOn,
      params,
    );
    return res;
  }

  async fetchHomeworkDates(
    startAfterOrOn?: Date,
  ): Promise<Collection<number, HomeworkDate>> {
    const params = new URLSearchParams();
    params.append("additional", `swigemaaktVinkjes`);
    params.append("additional", `leerlingen`);
    const homework: Collection<
      number,
      HomeworkDate
    > = await this._fetchManyHomework(
      endpoints.homeworkDate,
      HomeworkDate,
      startAfterOrOn,
      params,
    );
    return homework;
  }

  async fetchHomeworkWeeks(
    // TODO: make the args form weeknumbers
    startAfterOrOn?: Date,
    weekNumbers?: number[],
  ): Promise<Collection<number, HomeworkWeek>> {
    const params = new URLSearchParams();
    const schoolYear = await this._user.schoolYearManager.fetchCurrent();
    console.log(schoolYear);
    if (!schoolYear) throw Error("Couldn't fetch the current school year");
    startAfterOrOn =
      startAfterOrOn || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    weekNumbers = weekNumbers || schoolYear.weekNumbers(startAfterOrOn);
    console.log(weekNumbers);
    for (let numb of weekNumbers) {
      // TODO: Why doesn't this work?!
      // params.append("weeknummer", `${numb}`);
    }
    params.append("schooljaar", `${schoolYear.id}`);
    params.append("additional", `swigemaaktVinkjes`);
    params.append("additional", `leerlingen`);
    console.log(params);
    const res: api_huiswerk_week = await this.call({
      url: endpoints.homeworkWeek,
      params: params,
    });
    console.log(res);
    const coll: Collection<number, HomeworkWeek> = new Collection();
    for (let item of res.items) {
      coll.set(item.links[0].id, new HomeworkWeek(this._user, { raw: item }));
    }
    return coll;
  }

  private async _fetchManyHomework(
    url: string,
    toClass: typeof HomeworkAppointment | typeof HomeworkDate,
    startAfterOrOn?: Date,
    paramsParam?: URLSearchParams,
  ): Promise<Collection<number, any>> {
    const homeworks: Collection<
      number,
      HomeworkDate | HomeworkAppointment
    > = new Collection();
    let start_date =
      startAfterOrOn || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (;;) {
      const params = new URLSearchParams(paramsParam);
      params.set("begintNaOfOp", `${start_date.toISOString().split("T")[0]}`);
      const data:
        | api_huiswerk_datum
        | api_huiswerk_studiewijzer = await this.call({
        url: url,
        params: params,
      });
      console.log(data);
      const { items } = data;
      for (let item of items) {
        let new_date = new Date(item.datumTijd);
        if (new_date.valueOf() > start_date.valueOf()) {
          start_date = new_date;
        }
        if (!homeworks.has(item.links[0].id)) {
          // @ts-ignore
          const newClass = new toClass(this._user, { raw: item });

          console.log(newClass.id);
          homeworks.set(newClass.id, newClass);
        }
      }
      start_date = new Date(start_date.valueOf() - 1.5 * 24 * 60 * 60 * 1000);
      if (items.length < 100) break;
    }

    homeworks.sort((a, b) => b.dateTime.valueOf() - a.dateTime.valueOf());
    return homeworks;
  }
}
