import baseApiClass from "../baseApiClass";
import {
  api_huiswerk_week_item,
  api_studiewijzerItem_item,
} from "../somtoday_api_types";
import User from "../user";
import StudyGuideItem from "./studyGuideItem";

export default class HomeworkWeek extends baseApiClass {
  public id!: number;
  public href!: string;

  public synchronizesWith?: string;
  public weekNumberFrom!: number;
  public weekNumberUpToAndIncluding!: number;
  public sorting!: number;

  // private _raw_studyGuide!: api_studiewijzer_item;
  private _raw_studyGuideItem!: api_studiewijzerItem_item;

  public fetched: Promise<HomeworkWeek>;
  private _fetchedResolver!: (
    value: HomeworkWeek | PromiseLike<HomeworkWeek>,
  ) => void;
  private _fetchedRejecter!: (value?: Error | PromiseLike<Error>) => void;
  constructor(
    private _user: User,
    _Partial: {
      id?: number;
      href?: string;
      raw?: api_huiswerk_week_item;
    },
  ) {
    super(_user, {
      method: "get",
      baseURL: `${_user.baseURL}/studiewijzeritemweektoekenningen`,
      headers: { Authorization: `Bearer ${_user.accessToken}` },
    });
    this.fetched = new Promise((resolve, reject) => {
      this._fetchedResolver = resolve;
      this._fetchedRejecter = reject;
    });

    if (_Partial.raw) {
      this._fetchedResolver(this._storeHomeworkWeek(_Partial.raw));
    } else if (_Partial.id) {
      this.id = _Partial.id;
      this.fetchHomeworkWeek().then((classs) => {
        this._fetchedResolver(classs);
      });
    } else if (_Partial.href) {
      this.href = _Partial.href;
      this.call({ baseURL: this.href }).then((raw: api_huiswerk_week_item) => {
        this._fetchedResolver(this._storeHomeworkWeek(raw));
      });
    } else throw new Error("You must provide a HomeworkWeek Partial");
  }
  public async fetchHomeworkWeek(): Promise<HomeworkWeek> {
    const data = await this.call({ url: `${this.id}` });
    return this._storeHomeworkWeek(data);
  }
  private _storeHomeworkWeek(raw: api_huiswerk_week_item): HomeworkWeek {
    this.id = raw.links[0].id;
    this.href = raw.links[0].href;

    this.synchronizesWith = raw.synchroniseertMet;
    this.weekNumberFrom = raw.weeknummerVanaf;
    this.weekNumberUpToAndIncluding = raw.weeknummerTm;
    this.sorting = raw.sortering;
    this._raw_studyGuideItem = raw.studiewijzerItem;

    return this;
  }

  // get studyGuide(): StudyGuide {
  //   return new StudyGuide(this._user, { raw: this._raw_studyGuide });
  // }
  get studyGuideItem(): StudyGuideItem | undefined {
    if (!this._raw_studyGuideItem) return;
    return new StudyGuideItem(this._user, { raw: this._raw_studyGuideItem });
  }
  toObject() {
    return {
      id: this.id,
      href: this.href,
      synchronizesWith: this.synchronizesWith,
      weekNumberFrom: this.weekNumberFrom,
      weekNumberUpToAndIncluding: this.weekNumberUpToAndIncluding,
      sorting: this.sorting,
      // studyGuide: this.studyGuide.toObject(),
      studyGuideItem: this.studyGuideItem?.toObject(),
    };
  }
}
