import { EventEmitter } from "events";
import Debug from "debug";
import axios, { AxiosBasicCredentials } from "axios";
import { APP_ID, APP_SECRET } from "./constants";
import { InvalidTokenError } from "./errors";
import Grade from "./grade";
import Course from "./course";

import qs = require("qs");
import baseApiClass from "./baseApiClass";
import { api_cijfer, api_leerling, geslacht } from "./somtoday_api_types";

const log = Debug("user");

class User extends baseApiClass {
  public id!: number;
  public uuid!: string;
  public pupilNumber!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public mobileNumber?: string;
  public birthDate!: Date;
  public gender!: geslacht;

  public authenticated: Promise<User>;

  private _authenticatedResolver!: (value: User | PromiseLike<User>) => void;
  private _authenticatedRejecter!: (value?: Error | PromiseLike<Error>) => void;

  constructor(
    public accessToken: string,
    public refreshToken: string,
    public idToken: string,
    public somtodayApiUrl: string,
  ) {
    super({
      baseURL: `${somtodayApiUrl}/rest/v1`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    log("Initializing user");
    this._fetchInfo = this._fetchInfo.bind(this);
    this._refreshToken = this._refreshToken.bind(this);

    this.authenticated = new Promise((resolve, reject) => {
      this._authenticatedResolver = resolve;
      this._authenticatedRejecter = reject;
    });

    this._fetchInfo().then((userInfo) => {
      this.id = userInfo.links[0].id;
      this.uuid = userInfo.UUID;
      this.pupilNumber = userInfo.leerlingnummer;
      this.firstName = userInfo.roepnaam;
      this.lastName = userInfo.achternaam;
      this.email = userInfo.email;
      this.mobileNumber = userInfo.mobielNummer;
      this.birthDate = new Date(userInfo.geboortedatum);
      this.gender = userInfo.geslacht;
      this._authenticatedResolver(this);
    });
    // .catch(e => {
    //   // if (e instanceof InvalidTokenError) {
    //   //   log("Unable to refresh token, please make sure you are using the correct token.")
    //   //   throw new InvalidTokenError();
    //   // }
    // });
  }

  async getGrades(): Promise<Array<Grade>> {
    const grades: Array<Grade> = [];

    let i = 0;
    let j = 99;

    // do this until there are no more grades
    for (;;) {
      const data: api_cijfer = await this.call({
        method: "get",
        url: `/resultaten/huidigVoorLeerling/${this.id}`,
        headers: {
          range: `items=${i}-${j}`,
        },
      });

      i += 100;
      j += 100;

      const { items } = data;
      items.forEach((grade) => {
        const { vak } = grade;
        const course = new Course(vak.links[0].id, vak.afkorting, vak.naam);

        grades.push(
          new Grade(
            grade.links[0].id,
            grade.resultaat,
            grade.resultaatLabel,
            grade.type,
            grade.omschrijving,
            grade.leerjaar,
            grade.periode,
            grade.weging,
            grade.examenWeging,
            grade.toetsNietGemaakt,
            grade.teltNietmee,
            grade.isExamendossierResultaat,
            grade.isVoortgangsdossierResultaat,
            new Date(grade.datumInvoer),
            course,
          ),
        );
      });

      if (data.items.length < 100) break;
    }

    grades.sort((a, b) => a.dateOfEntry.getTime() - b.dateOfEntry.getTime());
    return grades;
  }

  private async _fetchInfo() {
    log("Fetching user info");

    return this.call({
      method: "get",
      url: "/leerlingen",
    }).then((data: api_leerling) => {
      const userInfo = data.items[0];
      return userInfo;
    });
  }

  private async _refreshToken(refreshToken: string): Promise<boolean | void> {
    log("Token expired");
    log("Refreshing user token");
    const body = {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: APP_ID,
    };

    return axios
      .post("https://production.somtoday.nl/oauth2/token", qs.stringify(body), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((authResponse) => {
        const { data } = authResponse;
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.idToken = data.id_token;
        //this.emit("token_refreshed");

        return true;
      })
      .catch((e) => {
        if (
          e.response.data.error === "invalid_grant" ||
          (e.response.data.error === "access_denied" &&
            e.response.data.error_description ===
              "Access denied by resource owner or authorization server: Unauthorized account")
        ) {
          log("Unable to refresh token");
          // todo: make this better
          this._authenticatedRejecter(new InvalidTokenError());
        }
      });
  }
}

export { User as default };
