import baseApiClass from "./baseApiClass";
import {
  api_assemblyResults_item,
  api_bijlage_item,
  api_uploadContext_item,
  api_uploadContext_item_fileState,
} from "./somtoday_api_types";
import User from "./user";

export default class Attachment extends baseApiClass {
  // DOESN'T HAVE A HREF TO FETCH
  public id!: number;
  public description!: string; // The name of the file most of the time
  public uploadContext!: uploadContext;
  public assemblyResults!: Array<assemblyResults>;
  public sorting!: number; //0;
  public visibleForStudents!: boolean;
  constructor(
    private _user: User,
    private _attachmentPartial: {
      raw: api_bijlage_item;
    },
  ) {
    super(_user);
  }

  private _storeAttachment(raw: api_bijlage_item): Attachment {
    //
    this.id = raw.links[0].id;
    this.description = raw.omschrijving; // The name of the file most of the time
    this.uploadContext = new uploadContext(this._user, {
      raw: raw.uploadContext,
    });
    this.assemblyResults = raw.assemblyResults.map(
      (raw) => new assemblyResults(this._user, { raw }),
    );
    this.sorting = raw.sortering;
    this.visibleForStudents = raw.zichtbaarVoorLeerling;
    return this;
  }
}

export class uploadContext extends baseApiClass {
  public id!: number;
  public fileState!: api_uploadContext_item_fileState;
  public assemblyId!: string;
  constructor(
    private _user: User,
    private _uploadContextPartial: { raw: api_uploadContext_item },
  ) {
    super(_user);
    if (_uploadContextPartial.raw) {
      this._storeUploadContext(_uploadContextPartial.raw);
    } else throw new Error("You must enter an uploadContext partial");
  }

  private _storeUploadContext(raw: api_uploadContext_item): uploadContext {
    this.id = raw.links[0].id;
    this.fileState = raw.fileState;
    this.assemblyId = raw.assemblyId;
    return this;
  }
}
export class assemblyResults extends baseApiClass {
  public id!: number;
  public fileExtension!: string;
  public assemblyFileType!: string;
  public mimeType!: string;
  public fileName!: string;
  public fileSize!: number;
  public fileType!: string;
  public fileUrl!: string;
  public sslUrl!: string;

  constructor(
    private _user: User,
    private _assemblyResultsPartial: { raw: api_assemblyResults_item },
  ) {
    super(_user);
    if (_assemblyResultsPartial.raw)
      this._storeAssemblyResults(_assemblyResultsPartial.raw);
    else throw new Error("You must enter an assemblyResults partial");
  }

  private _storeAssemblyResults(raw: api_assemblyResults_item) {
    this.id = raw.links[0].id;
    this.fileExtension = raw.fileExtension;
    this.assemblyFileType = raw.assemblyFileType;
    this.mimeType = raw.mimeType;
    this.fileName = raw.fileName;
    this.fileSize = raw.fileSize;
    this.fileType = raw.fileType;
    this.fileUrl = raw.fileUrl;
    this.sslUrl = raw.sslUrl;
  }
}
