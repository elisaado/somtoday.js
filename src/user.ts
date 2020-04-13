class User {
  constructor(
    public id: number,
    public pupilNumber: number,
    public firstName: string,
    public lastName: string,
    public email: string,
    public mobileNumber: string,
    public birthDate: Date,
    public gender: string,

    public accessToken: string,
    public refreshToken: string,
    public idToken: string,
    public somtodayApiUrl: string,
  ) {}
}

export { User as default };
