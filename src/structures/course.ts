import baseApiClass from "../baseApiClass";
import { api_vak_item } from "../somtoday_api_types";
import User from "../user";

class Course extends baseApiClass {
  public id!: number;
  public href!: string;
  public abbreviation!: string;
  public name!: string;

  public fetched: Promise<Course>;
  private _fetchedResolver!: (value: Course | PromiseLike<Course>) => void;
  private _fetchedRejecter!: (value?: Error | PromiseLike<Error>) => void;
  constructor(
    private _user: User,
    private _coursePartial: { id?: number; href?: string; raw?: api_vak_item },
  ) {
    super(_user, {
      method: "get",
      baseURL: _user.baseURL,
      headers: {
        Authorization: `Bearer ${_user.accessToken}`,
      },
    });
    this.fetched = new Promise((resolve, reject) => {
      this._fetchedResolver = resolve;
      this._fetchedRejecter = reject;
    });

    if (_coursePartial.id) {
      this.id = _coursePartial.id;
      this.fetchCourse().then((course) => this._fetchedResolver(course));
    } else if (_coursePartial.href) {
      this.call({
        baseURL: _coursePartial.href,
      }).then((data: api_vak_item) => {
        this._fetchedResolver(this._storeCourse(data));
      });
    } else if (_coursePartial.raw) {
      this._fetchedResolver(this._storeCourse(_coursePartial.raw));
    } else throw new Error("You must enter a course partial");
  }
  public async fetchCourse(): Promise<Course> {
    const data = await this.call({
      url: `/vakken/${this.id}`,
    });
    return this._storeCourse(data);
  }
  private _storeCourse(courseData: api_vak_item): Course {
    this.id = courseData.links[0].id;
    this.abbreviation = courseData.afkorting;
    this.name = courseData.naam;
    return this;
  }
}

export default Course;
