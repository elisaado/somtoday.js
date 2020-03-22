export class Leerling {
  constructor(
    public id: number,
    public leerlingNummer: number,
    public roepnaam: string,
    public achternaam: string,
    public email: string,
    public mobielNummer: string,
    public geboortedatum: Date,
    public geslacht: string,
  ) {}
}
