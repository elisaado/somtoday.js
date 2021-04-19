import baseApiClass from "./helpers/baseApiClass";
import Course from "./course";
import {
  api_cijfer,
  api_cijfer_item,
  api_cijfer_resultaatLabel,
  api_cijfer_type,
} from "./helpers/somtoday_api_types";
import Student from "./student";
import User from "./user";

export default class Grade extends baseApiClass {
  public id!: number;
  public href!: string;
  public grade: string | undefined;
  public gradeLabel: api_cijfer_resultaatLabel | undefined;
  public type!: api_cijfer_type;
  public description: string | undefined;

  public year!: number;
  public period!: number;

  public weight: number | undefined;
  public examWeight: number | undefined;

  public testNotMade?: boolean;
  public doesNotCount?: boolean;
  public countsForExamFile?: boolean;
  public countsForProgressFile?: boolean;

  public dateOfEntry!: Date;

  public raw!: api_cijfer_item;
  public fetched: Promise<Grade>;
  private _fetchedResolver!: (value: Grade | PromiseLike<Grade>) => void;
  private _fetchedRejecter!: (value?: Error | PromiseLike<Error>) => void;
  constructor(
    private _user: User,
    private _gradePartial: {
      raw?: api_cijfer_item;
      id?: number;
      href?: string;
    },
  ) {
    super(_user, {
      baseURL: `${_user.baseURL}`,
      method: "GET",
    });
    this.fetched = new Promise((resolve, reject) => {
      this._fetchedResolver = resolve;
      this._fetchedRejecter = reject;
    });

    if (_gradePartial.href) {
      this.call({
        baseURL: _gradePartial.href,
      }).then((response: api_cijfer) => {
        this._storeGrade(response.items[0]);
        this._fetchedResolver(this);
      });
    } else if (_gradePartial.id) {
      this.fetchGrade().then(() => {
        this._fetchedResolver(this);
      });
    } else if (_gradePartial.raw) {
      this._storeGrade(_gradePartial.raw);
      this._fetchedResolver(this);
    } else throw new Error("You must supply a grade partial");
  }
  get course(): Course {
    const { vak } = this.raw;
    const course = new Course(this._user, { raw: vak });
    return course;
  }
  get student(): Student {
    const { leerling } = this.raw;
    return new Student(this._user, { raw: leerling });
  }
  async fetchGrade(): Promise<Grade> {
    return this.call({
      url: `/resultaten/${this.id}`,
    }).then((response: api_cijfer_item) => {
      return this._storeGrade(response);
    });
  }
  private _storeGrade(gradeInfo: api_cijfer_item): Grade {
    this.id = gradeInfo.links[0].id;
    this.href = gradeInfo.links[0].href!;
    this.grade = gradeInfo.resultaat;
    this.gradeLabel = gradeInfo.resultaatLabel;
    this.type = gradeInfo.type;
    this.description = gradeInfo.omschrijving;
    this.year = gradeInfo.leerjaar;
    this.period = gradeInfo.periode;
    this.weight = gradeInfo.weging;
    this.examWeight = gradeInfo.examenWeging;
    this.testNotMade = gradeInfo.toetsNietGemaakt;
    this.doesNotCount = gradeInfo.teltNietmee;
    this.countsForExamFile = gradeInfo.isExamendossierResultaat;
    this.countsForProgressFile = gradeInfo.isVoortgangsdossierResultaat;
    this.dateOfEntry = new Date(gradeInfo.datumInvoer);
    this.raw = gradeInfo;
    return this;
  }
}
