import User from "../user";
import baseApiClass from "../baseApiClass";
import { api_externeMaterialen_item } from "../somtoday_api_types";

export default class ExternalMaterial extends baseApiClass {
  public id!: number;
  public uri!: string;
  public description!: string;
  public contentType!: string;
  public sorting!: number;
  public visibleForStudents!: boolean;

  constructor(
    private _user: User,
    private _Partial: {
      raw: api_externeMaterialen_item;
    },
  ) {
    super(_user);
    if (_Partial.raw) {
      this._storeExternalMaterial(_Partial.raw);
    } else throw new Error("You must provide a ExternalMaterial Partial");
  }
  private _storeExternalMaterial(
    raw: api_externeMaterialen_item,
  ): ExternalMaterial {
    this.id = raw.links[0].id;
    this.uri = raw.uri;
    this.description = raw.omschrijving;
    this.contentType = raw.contentType;
    this.sorting = raw.sortering;
    this.visibleForStudents = raw.zichtbaarVoorLeerlingen;
    return this;
  }
}
