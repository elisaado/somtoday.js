import axios, { AxiosRequestConfig, Method } from "axios";

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
  public async call(optionsParam?: AxiosRequestConfig): Promise<any> {
    let options: AxiosRequestConfig = Object.assign({}, this.axiosOptions);
    Object.assign(options, optionsParam);
    if (!options?.url) throw new Error("No request url provided");
    else if (!options?.method) throw new Error("No request method provided");

    const res = await axios.request(options);
    const data = res.data;
    return data;
  }
}
