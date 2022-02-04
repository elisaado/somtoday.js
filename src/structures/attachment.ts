import baseApiClass from "../baseApiClass";
import {
  api_assemblyResults_item,
  api_bijlage_item,
  api_uploadContext_item,
  api_uploadContext_item_fileState,
} from "../somtoday_api_types";
import User from "../user";

export default class Attachment extends baseApiClass {
  public id!: number;
  public description!: string; // The name of the file most of the time
  private raw_uploadContext!: api_uploadContext_item;
  private raw_assemblyResults!: Array<api_assemblyResults_item>;
  public sorting!: number;
  public visibleForStudents!: boolean;
  constructor(
    private _user: User,
    private _attachmentPartial: {
      raw: api_bijlage_item;
    },
  ) {
    super(_user);
    this._storeAttachment(_attachmentPartial.raw);
  }

  private _storeAttachment(raw: api_bijlage_item): Attachment {
    //
    this.id = raw.links[0].id;
    this.description = raw.omschrijving;
    this.raw_uploadContext = raw.uploadContext;

    this.raw_assemblyResults = raw.assemblyResults;
    this.sorting = raw.sortering;
    this.visibleForStudents = raw.zichtbaarVoorLeerling;
    return this;
  }
  get uploadContext(): uploadContext {
    return new uploadContext(this._user, {
      raw: this.raw_uploadContext,
    });
  }
  get assemblyResults(): Array<assemblyResults> {
    return this.raw_assemblyResults.map(
      (raw) => new assemblyResults(this._user, { raw }),
    );
    //
  }

  toObject() {
    return {
      id: this.id,
      description: this.description,
      sorting: this.sorting,
      visibleForStudents: this.visibleForStudents,
      uploadContext: this.uploadContext.toObject(),
      assemblyResults: this.assemblyResults.map((assemblyResult) =>
        assemblyResult.toObject(),
      ),
    };
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
  toObject() {
    return {
      id: this.id,
      fileState: this.fileState,
      assemblyId: this.assemblyId,
    };
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

  toObject() {
    return {
      id: this.id,
      fileExtension: this.fileExtension,
      assemblyFileType: this.assemblyFileType,
      mimeType: this.mimeType,
      fileName: this.fileName,
      fileSize: this.fileSize,
      fileType: this.fileType,
      fileUrl: this.fileUrl,
      sslUrl: this.sslUrl,
    };
  }
}
