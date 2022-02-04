import User from "../user";

export interface Credentials {
  username: string;
  password: string;
  organization?: string;
}

class Organization {
  constructor(
    public uuid: string,
    public name: string,
    public location: string,
  ) {
    // do nothing
  }
  /**
   * Authenticate to Somtoday
   * @param credentials User Log in credentials or refresh token
   * @returns {user} User - The User who logged in
   */
  async authenticate(credentials: Credentials | string): Promise<User> {
    if (typeof credentials == "string") {
      return new User(credentials);
    }
    credentials.organization = credentials.organization || this.uuid;
    if (credentials.username.trim().length === 0) {
      throw new Error("No username provided");
    } else if (credentials.password.trim().length === 0) {
      throw new Error("No password provided");
    }
    return new User(credentials);
  }
  toObject() {
    return {
      uuid: this.uuid,
      name: this.name,
      location: this.location,
    };
  }
}

export { Organization as default };
