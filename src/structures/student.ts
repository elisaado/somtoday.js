import { EventEmitter } from "events";
import Debug from "debug";
import axios, { AxiosBasicCredentials } from "axios";
import { APP_ID, APP_SECRET } from "../constants";
import { InvalidTokenError } from "./errors";
import Grade from "./grade";
import Course from "./course";

import qs = require("qs");
import baseApiClass from "../baseApiClass";
import {
  api_afspraken,
  api_cijfer,
  api_leerling,
  api_leerling_item,
  geslacht,
} from "../somtoday_api_types";
import User from "../user";
import Appointment from "./appointment";
import { URLSearchParams } from "url";
import GradeManager from "../managers/GradeManager";

const log = Debug("student");

class Student extends baseApiClass {
  public id!: number;
  public href!: string;
  public uuid!: string;
  public pupilNumber!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public mobileNumber?: string | null;
  public birthDate!: Date;
  public gender!: geslacht;
  public raw!: api_leerling_item;

  public fetched: Promise<Student>;
  private _fetchedResolver!: (value: Student | PromiseLike<Student>) => void;
  private _fetchedRejecter!: (value?: Error | PromiseLike<Error>) => void;

  private _gradeManager?: GradeManager;
  constructor(
    private _user: User,
    studentPartial?: { id?: number; raw?: api_leerling_item; href?: string },
  ) {
    super(_user, {
      baseURL: `${_user.somtodayApiUrl}/rest/v1`,
      headers: { Authorization: `Bearer ${_user.accessToken}` },
    });
    log("Initializing student");
    this.fetched = new Promise((resolve, reject) => {
      this._fetchedResolver = resolve;
      this._fetchedRejecter = reject;
    });

    if (studentPartial?.id) {
      this.id = studentPartial?.id;
      this.fetchStudent().then((student) => this._fetchedResolver(student));
    } else if (studentPartial?.raw) {
      this.raw = studentPartial?.raw;
      this._storeStudent(studentPartial?.raw);
      this._fetchedResolver(this);
    } else if (studentPartial?.href) {
      this.href = studentPartial?.href;
      this.fetchStudent().then((student) => this._fetchedResolver(student));
    }
  }

  get gradeManager(): GradeManager {
    return (
      this._gradeManager ||
      (this._gradeManager = new GradeManager(this._user, {
        studentID: this.id,
      }))
    );
  }

  async fetchStudent(): Promise<Student> {
    log("Fetching student info");
    return this.call({
      method: "get",
      url: `${
        this.href ? this.href : `/leerlingen${this.id ? `/${this.id}` : ""}`
      }`,
    })
      .then((data: any) => {
        let userInfo;
        if (data.items) userInfo = data.items[0];
        else userInfo = data;
        return userInfo;
      })
      .then((studentInfo) => {
        return this._storeStudent(studentInfo);
      });
  }
  private _storeStudent(studentInfo: api_leerling_item): Student {
    this.id = studentInfo.links[0].id;
    this.href = studentInfo.links[0].href!;
    this.uuid = studentInfo.UUID;
    this.pupilNumber = studentInfo.leerlingnummer;
    this.firstName = studentInfo.roepnaam;
    this.lastName = studentInfo.achternaam;
    this.email = studentInfo.email;
    this.mobileNumber = studentInfo.mobielNummer;
    this.birthDate = new Date(studentInfo.geboortedatum);
    this.gender = studentInfo.geslacht;
    this;
    return this;
  }
}

export { Student as default };
