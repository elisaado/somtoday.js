import baseApiClass from "../baseApiClass";
import endpoints from "../endpoints";
import { api_schooljaar_item } from "../somtoday_api_types";
import User from "../user";

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
      baseURL: _user.baseURL + endpoints.schoolYears,
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

  public weekNumbers(startDate?: Date, endDate?: Date): Array<number> {
    const start = this._weekNumber(startDate || this.fromDate);
    const between = this._weeksBetween(
      startDate || this.fromDate,
      endDate || this.toDate,
    );
    return this._range(0, between).map((numb) => (start + numb) % 52);
  }
  private _weeksBetween(d1: Date, d2: Date): number {
    return Math.ceil((d2.valueOf() - d1.valueOf()) / (7 * 24 * 60 * 60 * 1000));
  }
  private _weekNumber(d: Date): number {
    let oneJan = new Date(d.getFullYear(), 0, 1);
    let numberOfDays = Math.floor(
      (d.valueOf() - oneJan.valueOf()) / (24 * 60 * 60 * 1000),
    );
    let result = Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
    return result;
  }
  private _range(start: number, end: number): Array<number> {
    if (start === end) return [start];
    return [start, ...this._range(start + 1, end)];
  }
}
