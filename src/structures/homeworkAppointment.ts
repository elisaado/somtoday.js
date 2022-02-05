import { throws } from "assert";
import baseApiClass from "../baseApiClass";
import Class from "./class";
import Course from "./course";
import Establishment from "./establishment";
import {
  api_bijlage_item,
  api_externeMaterialen_item,
  api_huiswerkType,
  api_huiswerk_studiewijzer,
  api_huiswerk_studiewijzer_item,
  api_inlevermomenten_item,
  api_lesgroep_item,
  api_studiewijzerItem_item,
  api_vestiging_item,
} from "../somtoday_api_types";
import User from "../user";
import Attachment from "./attachment";
import ExternalMaterial from "./externalMaterial";
import SubmissionPeriod from "./submissionTime";
import submissionTime from "./submissionTime";
import SubmissionTime from "./submissionTime";
import StudyGuideItem from "./studyGuideItem";

export default class HomeworkAppointment extends baseApiClass {
  public id!: number;
  public href!: string;
  public sorting!: number;
  public dateTime!: Date;
  public creationDateTime!: Date | undefined;

  private _raw_class!: api_lesgroep_item;
  // private _raw_studyGuide!: api_studiewijzer_item;
  private _raw_studyGuideItem!: api_studiewijzerItem_item;

  public fetched: Promise<HomeworkAppointment>;
  private _fetchedResolver!: (
    value: HomeworkAppointment | PromiseLike<HomeworkAppointment>,
  ) => void;
  private _fetchedRejecter!: (value?: Error | PromiseLike<Error>) => void;
  constructor(
    private _user: User,
    _homeworkAppointmentPartial: {
      id?: number;
      href?: string;
      raw?: api_huiswerk_studiewijzer_item;
    },
  ) {
    super(_user, {
      method: "get",
      baseURL: `${_user.baseURL}/StudyGuideItemafspraaktoekenningen`,
      headers: { Authorization: `Bearer ${_user.accessToken}` },
    });
    this.fetched = new Promise((resolve, reject) => {
      this._fetchedResolver = resolve;
      this._fetchedRejecter = reject;
    });

    if (_homeworkAppointmentPartial.raw) {
      this._fetchedResolver(
        this._storeHomeworkAppointment(_homeworkAppointmentPartial.raw),
      );
    } else if (_homeworkAppointmentPartial.id) {
      this.id = _homeworkAppointmentPartial.id;
      this.fetchHomeworkAppointment().then((homeworkAppointment) => {
        this._fetchedResolver(homeworkAppointment);
      });
    } else if (_homeworkAppointmentPartial.href) {
      this.href = _homeworkAppointmentPartial.href;
      this.call({ baseURL: this.href }).then(
        (raw: api_huiswerk_studiewijzer_item) => {
          this._fetchedResolver(this._storeHomeworkAppointment(raw));
        },
      );
    }
  }

  public async fetchHomeworkAppointment(): Promise<HomeworkAppointment> {
    const raw = await this.call({
      url: `${this.id}`,
    });
    return this._storeHomeworkAppointment(raw);
  }

  private _storeHomeworkAppointment(
    raw: api_huiswerk_studiewijzer_item,
  ): HomeworkAppointment {
    this.id = raw.links[0].id;
    this.href = raw.links[0].href;
    this.dateTime = new Date(raw.datumTijd);
    this.creationDateTime = raw.aangemaaktOpDatumTijd
      ? new Date(raw.aangemaaktOpDatumTijd)
      : undefined;
    this.sorting = raw.sortering;

    this._raw_class = raw.lesgroep;
    this._raw_studyGuideItem = raw.studiewijzerItem;
    return this;
  }

  get class(): Class {
    return new Class(this._user, { raw: this._raw_class });
  }
  // get studyGuide(): StudyGuide {
  //   return new StudyGuide(this._user, { raw: this._raw_studyGuide });
  // }
  get studyGuideItem(): StudyGuideItem {
    if (!this._raw_studyGuideItem) throw new Error("No study guide item found");
    return new StudyGuideItem(this._user, { raw: this._raw_studyGuideItem });
  }

  public toObject() {
    return {
      id: this.id,
      href: this.href,
      sorting: this.sorting,
      dateTime: this.dateTime,
      creationDateTime: this.creationDateTime,
      class: this.class.toObject(),
      // studyGuide: this.studyGuide.toObject(),
      studyGuideItem: this.studyGuideItem.toObject(),
    };
  }
}
