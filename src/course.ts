import { api_vak_item } from "./somtoday_api_types";

class Course {
  public id: number;
  public abbreviation: string;
  public name: string;
  constructor(public raw: api_vak_item) {
    this.id = raw.links[0].id;
    this.abbreviation = raw.afkorting;
    this.name = raw.naam;
  }
}

export default Course;
