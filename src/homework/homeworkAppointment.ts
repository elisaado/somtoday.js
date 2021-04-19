import { throws } from "assert";
import baseApiClass from "../helpers/baseApiClass";
import Class from "../class";
import Course from "../course";
import Establishment from "../establishment";
import {
  api_bijlage_item,
  api_externeMaterialen_item,
  api_huiswerkType,
  api_huiswerk_studiewijzer,
  api_huiswerk_studiewijzer_item,
  api_inlevermomenten_item,
  api_lesgroep_item,
  api_studiewijzerItem_item,
  api_studiewijzer_item,
  api_vestiging_item,
} from "../helpers/somtoday_api_types";
import User from "../user";
import Attachment from "../helpers/attachment";
import ExternalMaterial from "../helpers/externalMaterial";
import SubmissionPeriod from "../helpers/submissionTime";
import submissionTime from "../helpers/submissionTime";
import SubmissionTime from "../helpers/submissionTime";
import StudyGuide from "./studyGuide";
import StudyGuideItem from "./studyGuideItem";

// TODO: make a week and day copy of this

export class HomeworkAppointment extends baseApiClass {
  public id!: number;
  public href!: string;
  public sorting!: number;
  public dateTime!: Date;
  public creationDateTime!: Date | undefined;

  private _raw_class!: api_lesgroep_item;
  private _raw_studyGuide!: api_studiewijzer_item;
  private _raw_studyGuideItem!: api_studiewijzerItem_item;

  public fetched: Promise<HomeworkAppointment>;
  private _fetchedResolver!: (
    value: HomeworkAppointment | PromiseLike<HomeworkAppointment>,
  ) => void;
  private _fetchedRejecter!: (value?: Error | PromiseLike<Error>) => void;
  constructor(
    private _user: User,
    private _homeworkAppointmentPartial: {
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
    if (_homeworkAppointmentPartial.id) {
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
    } else if (_homeworkAppointmentPartial.raw) {
      this._fetchedResolver(
        this._storeHomeworkAppointment(_homeworkAppointmentPartial.raw),
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
    this.dateTime = new Date(raw.datumTijd);
    this.creationDateTime = raw.aangemaaktOpDatumTijd
      ? new Date(raw.aangemaaktOpDatumTijd)
      : undefined;
    this.sorting = raw.sortering;

    this._raw_class = raw.lesgroep;
    this._raw_studyGuide = raw.studiewijzer;
    this._raw_studyGuideItem = raw.studiewijzerItem;
    return this;
  }

  get class(): Class {
    return new Class(this._user, { raw: this._raw_class });
  }
  get studyGuide(): StudyGuide {
    return new StudyGuide(this._user, { raw: this._raw_studyGuide });
  }
  get studyGuideItem(): StudyGuideItem {
    return new StudyGuideItem(this._user, { raw: this._raw_studyGuideItem });
  }
}
