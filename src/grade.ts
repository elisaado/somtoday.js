import Course from "./course";
import {
  api_cijfer_resultaatLabel,
  api_cijfer_type,
} from "./somtoday_api_types";

export default class Grade {
  constructor(
    public id: number,
    public grade: string | undefined,
    public gradeLabel: api_cijfer_resultaatLabel | undefined,
    public type: api_cijfer_type,
    public description: string | undefined,

    public year: number,
    public period: number,

    public weight: number | undefined,
    public examWeight: number | undefined,

    public testNotMade: boolean,
    public doesNotCount: boolean,
    public countsForExamFile: boolean,
    public countsForProgressFile: boolean,

    public dateOfEntry: Date,

    public course: Course,
  ) {}
}
