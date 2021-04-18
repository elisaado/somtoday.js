import axios, { AxiosRequestConfig, Method } from "axios";
import qs = require("qs");

export default class baseApiClass {
  public axiosOptions: AxiosRequestConfig;

  constructor(options?: AxiosRequestConfig) {
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
    if (options.data) options.data = qs.stringify(options.data);
    const res = await axios.request(options);
    const data = res.data;
    return data;
  }
}
