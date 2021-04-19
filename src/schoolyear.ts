import baseApiClass from "./helpers/baseApiClass";
import { api_schooljaar_item } from "./helpers/somtoday_api_types";
import User from "./user";

export default class SchoolYear extends baseApiClass {
  public id!: number;
  public href!: string;

  public name!: string;
  public fromDate!: Date;
  public toDate!: Date;

  public isCurrent!: boolean;

  public fetched: Promise<SchoolYear>;
  private _fetchedResolver!: (
    value: SchoolYear | PromiseLike<SchoolYear>,
  ) => void;
  private _fetchedRejecter!: (value?: Error | PromiseLike<Error>) => void;
  constructor(
    private _user: User,
    private _schoolYearPartial: {
      id?: number;
      href?: string;
      raw?: api_schooljaar_item;
    },
  ) {
    super(_user, {
      method: "get",
      baseURL: _user.baseURL + "/schooljaren",
      headers: { Authorization: "Bearer " + _user.accessToken },
    });
    this.fetched = new Promise((resolve, reject) => {
      this._fetchedResolver = resolve;
      this._fetchedRejecter = reject;
    });
    if (_schoolYearPartial.id) {
      this.id = _schoolYearPartial.id;
      this.fetchSchoolYear().then((schoolYear) => {
        this._fetchedResolver(schoolYear);
      });
    } else if (_schoolYearPartial.href) {
      this.href = _schoolYearPartial.href!;
      this.call({
        baseURL: this.href,
      }).then((raw: api_schooljaar_item) => {
        this._fetchedResolver(this._storeSchoolYear(raw));
      });
    } else if (_schoolYearPartial.raw) {
      this._fetchedResolver(this._storeSchoolYear(_schoolYearPartial.raw));
    } else throw new Error("You must enter a schoolYear partial");
  }

  public async fetchSchoolYear(): Promise<SchoolYear> {
    const raw = await this.call({
      url: `${this.id}`,
    });
    return this._storeSchoolYear(raw);
  }

  private _storeSchoolYear(raw: api_schooljaar_item): SchoolYear {
    this.id = raw.links[0].id;
    this.href = raw.links[0].href!;

    this.name = raw.naam;
    this.fromDate = new Date(raw.vanafDatum);
    this.toDate = new Date(raw.totDatum);

    this.isCurrent = raw.isHuidig;

    return this;
  }
}
