import baseApiClass from "../baseApiClass";
import { api_vestiging_item } from "../somtoday_api_types";
import User from "../user";

export default class Establishment extends baseApiClass {
  public id!: number;
  public href!: string;
  public name!: string;

  public fetched: Promise<Establishment>;
  private _fetchedResolver!: (
    value: Establishment | PromiseLike<Establishment>,
  ) => void;
  private _fetchedRejecter!: (value?: Error | PromiseLike<Error>) => void;
  constructor(
    private _user: User,
    private _establishmentPartial: {
      id?: number;
      href?: string;
      raw?: api_vestiging_item;
    },
  ) {
    super(_user, {
      method: "GET",
      baseURL: _user.baseURL,
    });
    this.fetched = new Promise((resolve, reject) => {
      this._fetchedResolver = resolve;
      this._fetchedRejecter = reject;
    });
    if (_establishmentPartial.id) {
      this.id = _establishmentPartial.id;
      this.fetchEstablishment().then((establishment) => {
        this._fetchedResolver(establishment);
      });
    } else if (_establishmentPartial.href) {
      this.call({ baseURL: _establishmentPartial.href }).then(
        (data: api_vestiging_item) => {
          this._fetchedResolver(this._storeEstablishment(data));
        },
      );
    } else if (_establishmentPartial.raw) {
      this._fetchedResolver(
        this._storeEstablishment(_establishmentPartial.raw),
      );
    } else throw new Error("You must enter an establishment partial");
  }
  async fetchEstablishment(): Promise<Establishment> {
    return this.call({
      url: `/vestigingen/${this.id}`,
    }).then((data: api_vestiging_item) => {
      return this._storeEstablishment(data);
    });
  }

  private _storeEstablishment(
    establishmentData: api_vestiging_item,
  ): Establishment {
    this.id = establishmentData.links[0].id;
    this.href = establishmentData.links[0].href!;
    this.name = establishmentData.naam;
    return this;
  }
}
