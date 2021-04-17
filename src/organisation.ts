import axios from "axios";
import User from "./user";
import { APP_ID, APP_SECRET, BASE64_AUTH } from "./constants";
import qs = require("qs");
import { ExecFileOptionsWithStringEncoding } from "child_process";

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

  async authenticate(credentials: Credentials): Promise<User> {
    credentials.organization = credentials.organization || this.uuid;
    return new User(credentials);
    if (credentials.username.trim().length === 0) {
      throw new Error("No username provided");
    } else if (credentials.password.trim().length === 0) {
      throw new Error("No password provided");
    }
  }
}

export { Organization as default };
