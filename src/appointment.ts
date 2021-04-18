import baseApiClass from "./baseApiClass";
import {
  api_afspraken,
  api_afspraken_item,
  api_afspraken_item_status,
  api_afspraken_item_type,
  api_vestiging_item,
} from "./somtoday_api_types";
import User from "./user";

export default class Appointment extends baseApiClass {
  public id!: number;
  public href!: string;
  public appointmentType!: api_afspraken_item_type;

  public startDateTime!: Date;
  public endDateTime!: Date;
  public startLessonHour!: number; // TODO: translate this
  public endLessonHour!: number;

  public title!: string;
  public description!: string;

  public attendanceRegistrationMandatory!: boolean;
  public attendanceRegistrationProcessed!: boolean;

  public appointmentStatus!: api_afspraken_item_status;

  public establishment: any; // TODO: make this a class
  public attachments: any; // TODO: make this a class
  public fetched: Promise<Appointment>;
  private _fetchedResolver!: (
    value: Appointment | PromiseLike<Appointment>,
  ) => void;
  private _fetchedRejecter!: (value?: Error | PromiseLike<Error>) => void;
  constructor(
    private _user: User,
    private _appointmentPartial: {
      id?: number;
      href?: string;
      raw?: api_afspraken_item;
    },
  ) {
    super({
      method: "get",
      baseURL: _user.baseURL,
      headers: {
        Authorization: `Bearer ${_user.accessToken}`,
      },
    });
    this.fetched = new Promise((resolve, reject) => {
      this._fetchedResolver = resolve;
      this._fetchedRejecter = reject;
    });

    if (_appointmentPartial.id) {
      this.id = _appointmentPartial.id;
      this.fetchAppointment().then((Appointment) => {
        this._fetchedResolver(Appointment);
      });
    } else if (_appointmentPartial.href) {
      this.call({
        baseURL: _appointmentPartial.href,
      })
        .then((response: api_afspraken) => {
          return this._storeAppointment(response.items[0]);
        })
        .then((appointment) => {
          this._fetchedResolver(appointment);
        });
    } else if (_appointmentPartial.raw) {
      this._fetchedResolver(this._storeAppointment(_appointmentPartial.raw));
    }
  }
  async fetchAppointment(): Promise<Appointment> {
    return this.call({
      url: `/afspraken/${this.id}`,
    }).then((response: api_afspraken) => {
      return this._storeAppointment(response.items[0]);
    });
  }
  _storeAppointment(appointmentData: api_afspraken_item): Appointment {
    this.id = appointmentData.links[0].id;
    this.href = appointmentData.links[0].href!;
    this.appointmentType = appointmentData.afspraakType;
    this.startDateTime = new Date(appointmentData.beginDatumTijd);
    this.endDateTime = new Date(appointmentData.eindDatumTijd);
    this.startLessonHour = appointmentData.beginLesuur;
    this.endLessonHour = appointmentData.eindLesuur;
    this.title = appointmentData.titel;
    this.description = appointmentData.omschrijving;
    this.attendanceRegistrationMandatory =
      appointmentData.presentieRegistratieVerplicht;
    this.attendanceRegistrationProcessed =
      appointmentData.presentieRegistratieVerwerkt;
    this.appointmentStatus = appointmentData.afspraakStatus;
    this.establishment = appointmentData; // TODO: make this a class
    this.attachments = appointmentData; // TODO: make this a class
    return this;
  }
}
