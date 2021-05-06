import baseApiClass from "../baseApiClass";
import Course from "./course";
import SchoolYear from "./schoolYear";
import {
  api_lesgroep_item,
  api_schooljaar_item,
  api_vak_item,
} from "../somtoday_api_types";
import User from "../user";
export default class Class extends baseApiClass {
  public id!: number;
  public href!: string;

  public UUID!: string;
  public name!: string;
  public raw_schoolYear!: api_schooljaar_item;
  public raw_course!: api_vak_item;
  public hasRootGroup!: boolean; // TODO: translate this less wacky
  public examFileSupported!: boolean;

  public fetched: Promise<Class>;
  private _fetchedResolver!: (value: Class | PromiseLike<Class>) => void;
  private _fetchedRejecter!: (value?: Error | PromiseLike<Error>) => void;
  constructor(
    private _user: User,
    private _classPartial: {
      id?: number;
      href?: string;
      raw?: api_lesgroep_item;
    },
  ) {
    super(_user, {
      method: "get",
      baseURL: `${_user.baseURL}/lesgroepen`,
      headers: { Authorization: `Bearer ${_user.accessToken}` },
    });
    this.fetched = new Promise((resolve, reject) => {
      this._fetchedResolver = resolve;
      this._fetchedRejecter = reject;
    });

    if (_classPartial.id) {
      this.id = _classPartial.id;
      this.fetchClass().then((classs) => {
        this._fetchedResolver(classs);
      });
    } else if (_classPartial.href) {
      this.href = _classPartial.href;
      this.call({ baseURL: this.href }).then((raw: api_lesgroep_item) => {
        this._fetchedResolver(this._storeClass(raw));
      });
    } else if (_classPartial.raw) {
      this._fetchedResolver(this._storeClass(_classPartial.raw));
    } else throw new Error("You must provide a class Partial");
  }
  public async fetchClass(): Promise<Class> {
    const data = await this.call({ url: `${this.id}` });
    return this._storeClass(data);
  }
  private _storeClass(raw: api_lesgroep_item): Class {
    this.id = raw.links[0].id;
    this.href = raw.links[0].href!;
    this.UUID = raw.UUID;
    this.name = raw.naam;
    this.raw_schoolYear = raw.schooljaar;
    this.raw_course = raw.vak;
    this.hasRootGroup = raw.heeftStamgroep;
    this.examFileSupported = raw.examendossierOndersteund;
    return this;
  }
  get course(): Course {
    return new Course(this._user, { raw: this.raw_course });
  }
  get schoolYear(): SchoolYear {
    return new SchoolYear(this._user, { raw: this.raw_schoolYear });
  }
}
