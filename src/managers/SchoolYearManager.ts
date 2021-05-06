import Collection from "@discordjs/collection";
import baseApiClass from "../baseApiClass";
import endpoints from "../endpoints";
import {
  api_afspraken_item_status,
  api_schooljaar,
  api_schooljaar_item,
} from "../somtoday_api_types";
import SchoolYear from "../structures/schoolYear";
import User from "../user";

export default class SchoolYearManager extends baseApiClass {
  public cache: Collection<number, SchoolYear>;
  constructor(private _user: User) {
    super(_user, {
      method: "get",
      baseURL: _user.baseURL,
      headers: { Authorization: `Bearer ${_user.accessToken}` },
    });
    this.cache = new Collection();
  }

  public async fetchCurrent(): Promise<SchoolYear | undefined> {
    return this.fetchYear(new Date());
  }
  public async fetchYear(
    search: number | Date,
  ): Promise<SchoolYear | undefined> {
    return typeof search == "number"
      ? this.cache.get(search) || new SchoolYear(this._user, { id: search })
      : this._fetchYearByDate(search);
  }
  private async _fetchYearByDate(date: Date): Promise<SchoolYear | undefined> {
    const res = this.cache.find(
      (item) =>
        item.fromDate.valueOf() < date.valueOf() &&
        date.valueOf() < item.toDate.valueOf(),
    );
    if (!res) {
      await this._fetchAll();
      return this.cache.find(
        (item) =>
          item.fromDate.valueOf() < date.valueOf() &&
          date.valueOf() < item.toDate.valueOf(),
      );
    }
    return res;
  }
  private async _fetchAll(): Promise<Collection<number, SchoolYear>> {
    const { items }: api_schooljaar = await this.call({
      url: endpoints.schoolYears,
    });
    items.map((item) => {
      this.cache.set(
        item.links[0].id,
        new SchoolYear(this._user, { raw: item }),
      );
    });
    return this.cache.clone();
  }
}
