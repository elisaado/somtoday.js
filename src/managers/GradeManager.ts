import Collection from "@discordjs/collection";
import { URLSearchParams } from "url";
import baseApiClass from "../baseApiClass";
import endpoints from "../endpoints";
import { api_cijfer } from "../somtoday_api_types";
import Course from "../structures/course";
import Grade from "../structures/grade";
import User from "../user";

export default class GradeManager extends baseApiClass {
  public cache?: Collection<number, Grade>;
  public studentID: number;

  constructor(private _user: User, options: { studentID: number }) {
    super(_user, {
      method: "get",
      baseURL: _user.baseURL,
      headers: { Authorization: `Bearer ${_user.accessToken}` },
      params: new URLSearchParams([
        ["additional", "berekendRapportCijfer"],
        ["additional", "samengesteldeToetskolomId"],
        ["additional", "resultaatkolomId"],
        ["additional", "cijferkolomId"],
        ["additional", "toetssoortnaam"],
        ["additional", "huidigeAnderVakKolommen"],
      ]),
    });
    this.studentID = options.studentID;
  }

  async getFromCourse(course: Course) {
    if (!this.cache) await this.fetchAll();
    if (!this.cache) return;
    const filtered = this.cache.filter((grade) => grade.course.id == course.id);
    return filtered;
  }

  async fetchAll() {
    const grades: Collection<number, Grade> = new Collection();

    let i = 0;
    let j = 99;

    // do this until there are no more grades
    for (;;) {
      const data: api_cijfer = await this.call({
        method: "get",
        url: endpoints.grades + `/${this.studentID}`,
        headers: {
          range: `items=${i}-${j}`,
        },
      });

      i += 100;
      j += 100;

      const { items } = data;
      for (let grade of items) {
        grades.set(grade.links[0].id, new Grade(this._user, { raw: grade }));
      }

      if (data.items.length < 100) break;
    }
    const sorted = grades.sort(
      (a, b) => a.dateOfEntry.getTime() - b.dateOfEntry.getTime(),
    );
    this.cache = sorted;
    return sorted;
  }
}
