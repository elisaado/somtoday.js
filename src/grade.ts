import Course from "./course";
import {
  api_cijfer_item,
  api_cijfer_resultaatLabel,
  api_cijfer_type,
} from "./somtoday_api_types";

export default class Grade {
  public id: number;
  public grade: string | undefined;
  public gradeLabel: api_cijfer_resultaatLabel | undefined;
  public type: api_cijfer_type;
  public description: string | undefined;

  public year: number;
  public period: number;

  public weight: number | undefined;
  public examWeight: number | undefined;

  public testNotMade: boolean;
  public doesNotCount: boolean;
  public countsForExamFile: boolean;
  public countsForProgressFile: boolean;

  public dateOfEntry: Date;
  constructor(public raw: api_cijfer_item) {
    this.id = raw.links[0].id;
    this.grade = raw.resultaat;
    this.gradeLabel = raw.resultaatLabel;
    this.type = raw.type;
    this.description = raw.omschrijving;
    this.year = raw.leerjaar;
    this.period = raw.periode;
    this.weight = raw.weging;
    this.examWeight = raw.examenWeging;
    this.testNotMade = raw.toetsNietGemaakt;
    this.doesNotCount = raw.teltNietmee;
    this.countsForExamFile = raw.isExamendossierResultaat;
    this.countsForProgressFile = raw.isVoortgangsdossierResultaat;
    this.dateOfEntry = new Date(raw.datumInvoer);

    this.raw = raw;
  }
  get course() {
    const { vak } = this.raw;
    const course = new Course(vak);
    return course;
  }
  get student() {
    const { leerling } = this.raw;
    return;
  }
}
