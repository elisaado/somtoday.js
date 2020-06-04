import Course from './course';

class Grade {

  constructor(
    public id: number,
    public grade: string,
    public type: string,
    public description: string,

    public year: number,
    public period: number,

    public weight: number,
    public examWeight: number,

    public testNotMade: boolean,
    public doesNotCount: boolean,
    public countsForExamFile: boolean,
    public countsForProgressFile: boolean,

    public dateOfEntry: Date,

    public course: Course,
  ) { }

}

export default Grade;
