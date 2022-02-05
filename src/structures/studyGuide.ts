import Establishment from "./establishment";
import User from "../user";
import baseApiClass from "../baseApiClass";
import { api_vestiging_item } from "../somtoday_api_types";

// export default class StudyGuide extends baseApiClass {
//   public id!: number;
//   public UUID!: string;
//   public name!: string;
//   public raw_establishment!: api_vestiging_item;

//   public fetched: Promise<StudyGuide>;

//   private _fetchedResolver!: (
//     value: StudyGuide | PromiseLike<StudyGuide>,
//   ) => void;
//   private _fetchedRejecter!: (value?: Error | PromiseLike<Error>) => void;
//   constructor(
//     private _user: User,
//     private _Partial: {
//       raw: api_studiewijzer_item;
//     },
//   ) {
//     super(_user);
//     this.fetched = new Promise((resolve, reject) => {
//       this._fetchedResolver = resolve;
//       this._fetchedRejecter = reject;
//     });
//     if (_Partial.raw) {
//       this._fetchedResolver(this._storeStudyGuide(_Partial.raw));
//     } else throw new Error("You must provide a StudyGuide Partial");
//   }
//   private _storeStudyGuide(raw: api_studiewijzer_item): StudyGuide {
//     this.id = raw.links[0].id;
//     this.name = raw.naam;
//     this.UUID = raw.uuid;
//     this.raw_establishment = raw.vestiging;
//     return this;
//   }

//   get establishment() {
//     return new Establishment(this._user, { raw: this.raw_establishment });
//   }

//   toObject() {
//     return {
//       id: this.id,
//       name: this.name,
//       UUID: this.UUID,
//       establishment: this.establishment.toObject(),
//     };
//   }
// }
