import Establishment from "../establishment";
import User from "../user";
import baseApiClass from "./baseApiClass";
import {
  api_afspraken_item_type,
  api_vestiging_item,
} from "./somtoday_api_types";

export default class AppointmentType extends baseApiClass {
  public id!: number;
  public href!: string;

  public name!: string;
  public description!: string;
  public defaultColour!: number;
  public category!: string;
  public activity!: string;

  public percentageIIVO!: number;
  public presenceRegistrationDefault!: boolean;
  public active!: boolean;

  public raw_establishment!: api_vestiging_item;
  constructor(
    private _user: User,
    private _AppointmentType: {
      id?: number;
      href?: string;
      raw?: api_afspraken_item_type;
    },
  ) {
    super(_user, {
      method: "get",
      baseURL: _user.baseURL,
    });
  }
  public async fetchAppointmentType(): Promise<AppointmentType> {
    const raw = await this.call();
    return this._storeAppointmentType(raw);
  }

  private _storeAppointmentType(raw: api_afspraken_item_type): AppointmentType {
    this.id = raw.links[0].id;
    this.href = raw.links[0].href!;

    this.name = raw.naam;
    this.description = raw.omschrijving;
    this.defaultColour = raw.standaardKleur;
    this.category = raw.categorie;
    this.activity = raw.activiteit;

    this.percentageIIVO = raw.percentageIIVO;
    this.presenceRegistrationDefault = raw.presentieRegistratieDefault;
    this.active = raw.actief;

    this.raw_establishment = raw.vestiging;
    return this;
  }

  get establishment(): Establishment {
    return new Establishment(this._user, { raw: this.raw_establishment });
  }
}
