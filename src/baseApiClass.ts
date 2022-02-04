import axios, { AxiosError, AxiosRequestConfig, Method } from "axios";
import qs from "qs";
import User from "./user";

export default class baseApiClass {
  public axiosOptions: AxiosRequestConfig;
  private __user!: User;
  constructor(user?: User, options?: AxiosRequestConfig) {
    if (user) this.__user = user;
    this.axiosOptions = options || {};
  }

  set setBaseUser(user: User) {
    this.__user = user;
  }
  /**
   * Call the somtoday api
   * @param {AxiosRequestConfig} [optionsParam] - The axios options for the api call
   * @param {boolean} [overwrite] - Only use the request options from the parameter
   * @returns {Promise} The result of the api call
   */
  public async call(
    optionsParam?: AxiosRequestConfig,
    overwrite?: boolean,
  ): Promise<any> {
    if (!this.__user)
      throw new Error("YOU NEED TO SET THE USER YOU DUMB PERSON ");

    let options: AxiosRequestConfig;
    if (overwrite && !optionsParam)
      throw new Error(
        "You cant overwrite if you don't supply your own options",
      );

    if (!overwrite) {
      options = Object.assign({}, this.axiosOptions, optionsParam);
      if (!options.headers) options.headers = {};
      if (this.axiosOptions.headers) {
        Object.assign(options.headers, this.axiosOptions.headers);
      }
      if (optionsParam?.headers) {
        Object.assign(options.headers, optionsParam.headers);
      }
    } else {
      options = optionsParam!;
    }
    if (!options?.baseURL && !options?.url)
      throw new Error("No request url provided");
    else if (!options?.method) throw new Error("No request method provided");

    if (
      options.headers &&
      Object.keys(options.headers).includes("Authorization") &&
      options.headers["Authorization"]?.startsWith("Bearer ")
    ) {
      options.headers["Authorization"] = "Bearer " + this.__user.accessToken;
    }

    if (options.data) options.data = qs.stringify(options.data);
    try {
      const res = await axios.request(options);
      const data = res.data;
      return data;
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        const refreshed = await this.__user.refreshRefreshToken();
        if (refreshed) {
          return this.call(optionsParam, overwrite);
        } else {
          throw err;
        }
      }
    }
  }
}
