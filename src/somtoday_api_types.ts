export interface api_auth_item {
  access_token: string;
  refresh_token: string;
  somtoday_api_url: string;
  somtoday_oop_url: string;
  scope: "openid";
  somtoday_tenant: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

// Raw api results
export interface api_leerling {
  items: Array<api_leerling_item>;
}
export interface api_cijfer {
  items: Array<api_cijfer_item>;
}
export interface api_vak {
  items: Array<api_vak_item>;
}
export interface api_afspraken {
  items: Array<api_afspraken_item>;
}
export interface api_huiswerk_studiewijzer {
  items: Array<api_huiswerk_studiewijzer_item>;
}
export interface api_huiswerk_datum {
  items: Array<api_huiswerk_datum_item>;
}
export interface api_huiswerk_week {
  items: Array<api_huiswerk_week_item>;
}
export interface api_schooljaar {
  items: Array<api_schooljaar_item>;
}

export type api_organisaties = [{ instellingen: Array<api_organisaties_item> }];

// Items
export interface api_leerling_item {
  $type: "leerling.RLeerling";
  links: Array<api_link_href>;
  permissions: Array<api_permission>;
  additionalObjects: any;
  UUID: api_UUID; // Like this: "ab123acd-abc1-1cba-blah-asd3a2df2sdf";
  leerlingnummer: number;
  roepnaam: string;
  achternaam: string;
  email: string;
  mobielNummer: string | null;
  geboortedatum: string; //"yyyy-mm-dd";
  geslacht: geslacht;
}
export interface api_cijfer_item {
  $type: "resultaten.RResultaat";
  links: Array<api_link_href>;
  permissions: Array<api_permission>;
  additionalObjects: any;
  herkansingstype: api_cijfer_herkansingstype;
  resultaat?: string; // string representation of an integer
  geldendResultaat?: string; // string representation of an integer
  datumInvoer: string; //ISO-8601 like "2020-09-24T21:03:16.992+02:00"
  teltNietmee: boolean;
  toetsNietGemaakt: boolean;
  leerjaar: number;
  periode: number;
  weging?: number;
  examenWeging?: number;
  resultaatLabel?: api_cijfer_resultaatLabel;
  resultaatLabelAfkorting?: api_cijfer_resultaatLabelAfkorting;
  isExamendossierResultaat: boolean;
  isVoortgangsdossierResultaat: boolean;
  type: api_cijfer_type;
  omschrijving?: string;
  vak: api_vak_item;
  leerling: api_leerling_item;
}
export interface api_vak_item {
  links: Array<api_link>;
  permissions: Array<api_permission>;
  additionalObjects: any;
  afkorting: string;
  naam: string;
}
export interface api_afspraken_item {
  $type: "participatie.RAfspraak";
  links: Array<api_link_href>;
  permissions: Array<api_permission>;
  additionalObjects: {
    vak?: api_vak_item | null;
    docentAfkortingen?: string;
    leerlingen?: api_leerling;
  };
  afspraakType: api_afspraken_item_type;
  beginDatumTijd: string; // ISO-8601 "2018-01-31T12:35:00.000+01:00";
  eindDatumTijd: string; // ISO-8601  "2018-01-31T13:25:00.000+01:00";
  beginLesuur: number;
  eindLesuur: number;
  titel: string;
  omschrijving: string;
  presentieRegistratieVerplicht: boolean;
  presentieRegistratieVerwerkt: boolean;
  afspraakStatus: api_afspraken_item_status;
  vestiging: api_vestiging_item;
  bijlagen: Array<api_bijlage_item>;
}
export interface api_afspraken_item_type {
  links: Array<api_link_href>;
  permissions: Array<api_permission>;
  additionalObjects: any;
  naam: string; //"les";
  omschrijving: string; //"les";
  standaardKleur: number; // cool?
  categorie: string; // "Rooster";
  activiteit: string; // "Verplicht";
  percentageIIVO: number; // 0;
  presentieRegistratieDefault: boolean;
  actief: boolean;
  vestiging: api_vestiging_item;
}

export interface api_vestiging_item {
  links: Array<api_link_href>;
  permissions: Array<api_permission>;
  additionalObjects: any;
  naam: string;
}
export interface api_bijlage_item {
  links: Array<api_link>;
  permissions: Array<api_permission>;
  additionalObjects: any;
  omschrijving: string; // The name of the file most of the time
  uploadContext: api_uploadContext_item;
  assemblyResults: Array<api_assemblyResults_item>;
  sortering: number; //0;
  zichtbaarVoorLeerling: boolean;
}
export interface api_uploadContext_item {
  links: Array<api_link>;
  permissions: Array<api_permission>;
  additionalObjects: any;
  fileState: api_uploadContext_item_fileState; //"ASSEMBLY_COMPLETED";
  assemblyId: string; //"eb166b7581284ce6b1f96a8fe40e88af";
}

export interface api_assemblyResults_item {
  links: Array<api_link>;
  permissions: Array<api_permission>;
  additionalObjects: any;
  assemblyFileType: string; //"MISC";
  fileExtension: string; //"ppt";
  mimeType: string; //"application/vnd.ms-powerpoint";
  fileSize: number; // in Bytes
  fileType: string; //"misc";
  fileUrl: string; //"https://ASDFASDF-ASDFASDF.ssl.cf3.rackcdn.com/documents/ASDFASDF/52/ASDFASDF/adsf.ppt";
  sslUrl: string; // "https://ASDFASDF-ASDFASDF.ssl.cf3.rackcdn.com/documents/ASDFASDF/52/ASDFASDF/asdf.ppt";
  fileName: string; // "asdf.ppt";
}

export interface api_huiswerk_studiewijzer_item {
  $type: "studiewijzer.RSWIAfspraakToekenning";
  links: Array<api_link_href>;
  permissions: Array<api_permission>;
  additionalObjects: any;
  // studiewijzer: api_studiewijzer_item;
  studiewijzerItem: api_studiewijzerItem_item;
  sortering: number;
  lesgroep: api_lesgroep_item;
  datumTijd: string; //"2020-09-24T11:45:00.000+02:00";
  aangemaaktOpDatumTijd?: string; // "2020-09-03T12:27:00.000+02:00";
}
export interface api_lesgroep_item {
  links: Array<api_link_href>;
  permissions: Array<api_permission>;
  additionalObjects: {};
  UUID: api_UUID;
  naam: string;
  schooljaar: api_schooljaar_item;
  vak: api_vak_item;
  heeftStamgroep: boolean;
  examendossierOndersteund: boolean;
}
export interface api_schooljaar_item {
  $type: "onderwijsinrichting.RSchooljaar";
  links: Array<api_link_href>;
  permissions: Array<api_permission>;
  additionalObjects: any;
  naam: string; // something like this "2020/2021";
  vanafDatum: string; // yyyy-mm-dd;
  totDatum: string; // yyyy-mm-dd
  isHuidig: boolean;
}
export interface api_huiswerk_datum_item {
  $type: "studiewijzer.RSWIDagToekenning";
  links: Array<api_link_href>;
  permissions: Array<api_permission>;
  additionalObjects: any;
  // studiewijzer: api_studiewijzer_item;
  studiewijzerItem: api_studiewijzerItem_item;
  sortering: 0; // TODO: what is this
  datumTijd: string; // ISO-8601 "2020-10-08T00:00:00.000+02:00";
  lesgroep: api_lesgroep_item;
}
// export interface api_studiewijzer_item {
//   links: Array<api_link>;
//   permissions: Array<api_permission>;
//   additionalObjects: any;
//   uuid: api_UUID;
//   naam: string;
//   vestiging: api_vestiging_item;
// }
export interface api_studiewijzerItem_item {
  links: Array<api_link_href>;
  permissions: Array<api_permission>;
  additionalObjects: any;
  onderwerp: string; // The text that is visible without having to click on an appointment
  huiswerkType: api_huiswerkType;
  omschrijving: string; //with html: "<p><em>Nieuw Nederlands</em> - Toets Leesvaardigheid</p><p><br></p><p>Leer de theorie van Lezen hoofdstuk 1 t/m 68 (blz. 34 t/m 419).</p><p><br></p>"";
  inleverperiodes: boolean;
  lesmateriaal: boolean;
  projectgroepen: boolean;
  bijlagen: Array<api_bijlage_item>;
  externeMaterialen: Array<api_externeMaterialen_item>;
  inlevermomenten: Array<api_inlevermomenten_item>;
  tonen: boolean;
  notitie?: string;
  notitieZichtbaarVoorLeerling: boolean;
}
export interface api_externeMaterialen_item {
  links: Array<api_link>;
  permissions: Array<api_permission>;
  additionalObjects: object;
  uri: string;
  omschrijving: string;
  contentType: string;
  sortering: number;
  zichtbaarVoorLeerlingen: boolean;
}
export interface api_inlevermomenten_item {
  // TODO: this needs more info, i only had one data point
  links: Array<api_link>;
  permissions: Array<api_permission>;
  additionalObjects: object;
  omschrijving: string;
  startGeldigheid: string;
  eindGeldigheid: string;
  plagiaatDetectie: boolean;
  stuurBerichtBijInlevering: boolean;
  herinnering: number;
  inleveringenAantal: number;
  inleveringenVerwacht: number;
  startSortering: number;
  eindSortering: number;
}
export interface api_huiswerk_week_item {
  $type: "studiewijzer.RSWIWeekToekenning";
  links: Array<api_link_href>;
  permissions: Array<api_permission>;
  additionalObjects: any;
  // studiewijzer: api_studiewijzer_item; //
  studiewijzerItem: api_studiewijzerItem_item;
  sortering: number;
  synchroniseertMet?: string;
  weeknummerVanaf: number;
  weeknummerTm: number;
}
export interface api_organisaties_item {
  uuid: api_UUID;
  naam: string;
  plaats: string;
  oidcurls: Array<oidcurl>;
}

export interface oidcurl {
  omschrijving: string;
  url: string;
  domain_hint: string;
}

// Extra stuff
export interface api_link {
  id: number; //id id;
  rel: api_link_rel;
  type: api_link_type;
}
export interface api_link_href {
  id: number; //id id;
  rel: api_link_rel;
  type: api_link_type;
  href: string; // api link to fetch student ;
}

export interface api_permission {
  full: string; //"api_link_type:operation:instance";
  type: api_link_type;
  operations: Array<api_permissions_operation>; // currently only "READ";
  instances: Array<string>; //"INSTANCE(student id)";
}
export enum api_link_rel {
  "self",
  "koppeling",
}
export enum api_link_type {
  "leerling.RLeerling",
  "lesgroep.RLesgroep",
  "instelling.RVestiging",

  "studiewijzer.RSWIBijlage",
  "studiewijzer.RSWIDagToekenning",
  "studiewijzer.RStudiewijzerItem",
  "studiewijzer.RAbstractStudiewijzer",
  "onderwijsinrichting.RSchooljaar",
  "onderwijsinrichting.RVak",
  "cloudfiles.bestanden.RUploadContext",
  "cloudfiles.bestanden.RAssemblyResult",
}
export enum api_permissions_operation {
  "READ",
}
export type api_UUID = string; // "ab123acd-abc1-1cba-blah-asd3a2df2sdf";
export enum geslacht {
  "Man",
  "Vrouw",
  // Meer?
}
export enum api_cijfer_type {
  "Toetskolom",
  "PeriodeGemiddeldeKolom",
  "RapportGemiddeldeKolom",
}
export enum api_cijfer_herkansingstype {
  "Geen",
  "EenKeerLaatste",
}
export enum api_cijfer_resultaatLabel {
  "exelent",
  "goed",
  "voldoende",
  "matig",
  "onvoldoende",
}
export enum api_cijfer_resultaatLabelAfkorting {
  "E",
  "G",
  "V",
  "M",
  "O",
}
export enum api_huiswerkType {
  "HUISWERK",
  "TOETS",
  "GROTE_TOETS",
}
export enum api_afspraken_item_status {
  "ACTIEF",
} // TODO: are there more of these?
export enum api_uploadContext_item_fileState {
  "ASSEMBLY_COMPLETED", //TODO: is there more?
}
