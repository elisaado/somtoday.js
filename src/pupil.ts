export class Pupil {
  constructor(
    public id: number,
    public pupilNumber: number,
    public firstName: string,
    public lastName: string,
    public email: string,
    public mobileNumber: string,
    public birthDate: Date,
    public gender: string,
  ) {}
}
