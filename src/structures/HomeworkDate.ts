import Class from "./class";
import baseApiClass from "../baseApiClass";
import {
  api_huiswerk_datum_item,
  api_lesgroep_item,
  api_studiewijzerItem_item,
  api_studiewijzer_item,
} from "../somtoday_api_types";
import User from "../user";
import StudyGuide from "./studyGuide";
import StudyGuideItem from "./studyGuideItem";

export default class HomeworkDate extends baseApiClass {
  public id!: number;
  public href!: string;
  public dateTime!: Date;
  public sorting!: number;

  private _raw_studyGuide!: api_studiewijzer_item;
  private _raw_studyGuideItem!: api_studiewijzerItem_item;
  private _raw_class!: api_lesgroep_item;

  public fetched: Promise<HomeworkDate>;
  private _fetchedResolver!: (
    value: HomeworkDate | PromiseLike<HomeworkDate>,
  ) => void;
  private _fetchedRejecter!: (value?: Error | PromiseLike<Error>) => void;
  constructor(
    private _user: User,
    private _Partial: {
      id?: number;
      href?: string;
      raw?: api_huiswerk_datum_item;
    },
  ) {
    super(_user, {
      method: "get",
      baseURL: `${_user.baseURL}/studiewijzeritemdagtoekenningen`,
      headers: { Authorization: `Bearer ${_user.accessToken}` },
    });
    this.fetched = new Promise((resolve, reject) => {
      this._fetchedResolver = resolve;
      this._fetchedRejecter = reject;
    });

    if (_Partial.id) {
      this.id = _Partial.id;
      this.fetchHomeworkDate().then((classs) => {
        this._fetchedResolver(classs);
      });
    } else if (_Partial.href) {
      this.href = _Partial.href;
      this.call({ baseURL: this.href }).then((raw: api_huiswerk_datum_item) => {
        this._fetchedResolver(this._storeHomeworkDate(raw));
      });
    } else if (_Partial.raw) {
      this._fetchedResolver(this._storeHomeworkDate(_Partial.raw));
    } else throw new Error("You must provide a HomeworkDate Partial");
  }
  public async fetchHomeworkDate(): Promise<HomeworkDate> {
    const data = await this.call({ url: `${this.id}` });
    return this._storeHomeworkDate(data);
  }
  private _storeHomeworkDate(raw: api_huiswerk_datum_item): HomeworkDate {
    this.id = raw.links[0].id;
    this.href = raw.links[0].href;

    this.dateTime = new Date(raw.datumTijd);
    this.sorting = raw.sortering;

    this._raw_studyGuide = raw.studiewijzer;
    this._raw_studyGuideItem = raw.studiewijzerItem;
    this._raw_class = raw.lesgroep;
    return this;
  }

  get studyGuide(): StudyGuide {
    return new StudyGuide(this._user, { raw: this._raw_studyGuide });
  }
  get studyGuideItem(): StudyGuideItem {
    return new StudyGuideItem(this._user, { raw: this._raw_studyGuideItem });
  }
  get class(): Class {
    return new Class(this._user, { raw: this._raw_class });
  }
}
