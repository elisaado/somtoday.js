import Collection from "@discordjs/collection";
import { cpuUsage } from "process";
import { URLSearchParams } from "url";
import baseApiClass from "../baseApiClass";
import { api_afspraken, api_afspraken_item } from "../somtoday_api_types";
import Appointment from "../structures/appointment";
import User from "../user";

export default class AppointmentManager extends baseApiClass {
  public cache: Collection<number, Appointment>;
  constructor(private _user: User) {
    super(_user, {
      method: "get",
      baseURL: _user.baseURL,
      headers: { Authorization: `Bearer ${_user.accessToken}` },
    });
    this.cache = new Collection();
  }
  /**
   * Gets an appointment, or appointments from this user.
   * @param {number|AppointmentQueryOptions} [appointment] The id of the appointment to fetch, or query paramaters.
   * @param {boolean} [cache=true] Whether to cache the messages.
   * @param {boolean} [force=false] Whether to skip the cache check and request the API.
   * @returns {Promise<Appointment>|Promise<Collection<number, Appointment>>}
   */
  async fetch(
    appointment: number | AppointmentQueryOptions,
    cache: boolean = true,
    force: boolean = true,
  ): Promise<Appointment | Collection<number, Appointment>> {
    return typeof appointment == "number"
      ? this._fetchId(appointment, cache, force)
      : this._fastFetchMany(appointment, cache, force);
  }
  private async _fetchId(
    id: number,
    cache: boolean,
    force: boolean,
  ): Promise<Appointment> {
    let appointment: Appointment | undefined = this.cache.get(id);
    if (force || !appointment) {
      appointment = new Appointment(this._user, { id: id });
      await appointment.fetched;
      if (cache) {
        this.cache.set(id, appointment);
      }
    }
    return appointment;
  }
  private async _fastFetchMany(
    options: AppointmentQueryOptions,
    to_cache: boolean,
    force: boolean,
  ): Promise<Collection<number, Appointment>> {
    // TODO: make this use cache when it can
    // TODO: fetches to much rn

    let start_date =
      options.startDate || new Date(Date.now() - 6 * 366 * 24 * 60 * 60 * 1000);
    const end_date =
      options.endDate || new Date(Date.now() + 6 * 366 * 24 * 60 * 60 * 1000);

    const appointments: Collection<number, Appointment> = new Collection();
    let rawArray: Array<api_afspraken_item> = [];

    const time = end_date.valueOf() - start_date.valueOf();
    const parts = Math.ceil(time / (10 * 24 * 60 * 60 * 1000));

    const part_size = Math.ceil(time / parts);
    const promises: Array<Promise<void>> = [];
    for (var i = 0; i < parts; i++) {
      promises.push(
        new Promise(async (resolve) => {
          const start_date_string = new Date(
            start_date.valueOf() + part_size * i,
          )
            .toISOString()
            .split("T")[0];
          const params = new URLSearchParams();
          // options.additional?.forEach((additional) => {
          //   params.append("additional", additional.toString());
          // });
          params.append("additional", "vak");
          params.append("additional", "docentAfkortingen");
          params.append("additional", "leerlingen");
          params.append("begindatum", start_date_string);
          const response = await this._fetchMany(params);
          rawArray = rawArray.concat(response);
          resolve();
        }),
      );
    }
    await Promise.all(promises);
    rawArray.forEach((appointment) => {
      if (appointments.has(appointment.links[0].id)) return;
      const newAppointment = new Appointment(this._user, {
        raw: appointment,
      });
      if (to_cache) {
        this.cache.set(appointment.links[0].id, newAppointment);
      }
      if (newAppointment.endDateTime.valueOf() < end_date.valueOf()) {
        appointments.set(appointment.links[0].id, newAppointment);
      }
    });

    const sorted_appointments = appointments.sort(
      (a, b) => b.startDateTime.valueOf() - a.startDateTime.valueOf(),
    );
    return sorted_appointments;
  }
  private async _fetchMany(
    params: URLSearchParams,
  ): Promise<Array<api_afspraken_item>> {
    const data: api_afspraken = await this.call({
      url: `/afspraken`,
      params: params,
    });
    const { items } = data;
    return items;
  }
}

export interface AppointmentQueryOptions {
  startDate?: Date;
  endDate?: Date;
  //additional?: Array<AppointmentQueryAdditional>;
}

export enum AppointmentQueryAdditional {
  "vak",
  "docentAfkortingen",
  "leerlingen",
}
