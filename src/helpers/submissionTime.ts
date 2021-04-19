import User from "../user";
import baseApiClass from "./baseApiClass";
import { api_inlevermomenten_item } from "./somtoday_api_types";

export default class SubmissionTime extends baseApiClass {
  public id!: number;
  public href!: string;

  public description!: string;
  public startValidity!: Date;
  public endValidity!: Date;
  public plagiarismDetection!: boolean;
  public sendMessageOnSubmission!: boolean;

  public reminder!: number;
  public submissionsAmount!: number;
  public submissionsExpected!: number;
  public startSorting!: number;
  public endSorting!: number;

  constructor(
    private _user: User,
    private _Partial: {
      raw: api_inlevermomenten_item;
    },
  ) {
    super(_user);

    if (_Partial.raw) {
      this._storeSubmissionTime(_Partial.raw);
    } else throw new Error("You must provide a SubmissionTime Partial");
  }
  private _storeSubmissionTime(raw: api_inlevermomenten_item): SubmissionTime {
    this.id = raw.links[0].id;

    this.description = raw.omschrijving;
    this.startValidity = new Date(raw.startGeldigheid);
    this.endValidity = new Date(raw.eindGeldigheid);
    this.plagiarismDetection = raw.plagiaatDetectie;
    this.sendMessageOnSubmission = raw.stuurBerichtBijInlevering;
    this.reminder = raw.herinnering;
    this.submissionsAmount = raw.inleveringenAantal;
    this.submissionsExpected = raw.inleveringenVerwacht;
    this.startSorting = raw.startSortering;
    this.endSorting = raw.eindSortering;
    return this;
  }
}
