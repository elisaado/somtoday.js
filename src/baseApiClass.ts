import axios, { AxiosError, AxiosRequestConfig, Method } from "axios";
import qs = require("qs");
import User from "./user";

export default class baseApiClass {
  public axiosOptions: AxiosRequestConfig;

  constructor(private __user: User, options?: AxiosRequestConfig) {
    this.axiosOptions = options || {};
  }
  /**
   * Call the somtoday api
   * @param {AxiosRequestConfig} [optionsParam] - The axios options for the api call
   * @returns {Promise} The result of the api call
   */
  public async call(
    optionsParam?: AxiosRequestConfig,
    overwrite?: boolean,
  ): Promise<any> {
    let options: AxiosRequestConfig;
    if (overwrite && !optionsParam)
      throw new Error(
        "You cant overwrite if you don't supply your own options",
      );

    if (!overwrite) {
      options = Object.assign({}, this.axiosOptions);
      Object.assign(options, optionsParam);
      if (this.axiosOptions.headers) {
        Object.assign(options.headers || {}, this.axiosOptions.headers);
      }
    } else {
      options = optionsParam!;
    }
    if (!options?.baseURL && !options?.url)
      throw new Error("No request url provided");
    else if (!options?.method) throw new Error("No request method provided");

    if (
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
      if (err.response.status === 401) {
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
