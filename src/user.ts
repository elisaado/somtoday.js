import axios from 'axios';
import { APP_ID, APP_SECRET } from './constants';
import { InvalidTokenError } from './errors';

import qs = require('qs');

class User {

  public id: number;
  public uuid: string;
  public pupilNumber: number;
  public firstName: string;
  public lastName: string;
  public email: string;
  public mobileNumber: string;
  public birthDate: Date;
  public gender: string;

  public authenticated: Promise<boolean>;

  private _authenticatedResolver: (value?: boolean | PromiseLike<boolean>) => void;
  private _authenticatedRejecter: (value?: Error | PromiseLike<Error>) => void;

  constructor(
    public accessToken: string,
    public refreshToken: string,
    public idToken: string,
    public somtodayApiUrl: string,
  ) {
    this._fetchInfo = this._fetchInfo.bind(this);
    this._refreshToken = this._refreshToken.bind(this);


    this.authenticated = new Promise((resolve, reject) => {
      this._authenticatedResolver = resolve;
      this._authenticatedRejecter = reject;
    });

    this._fetchInfo()
      .catch(e => {
        if (e.response.status === 401) {
          return this._refreshToken()
            .then(status => {
              if (!status) return undefined;
              return this._fetchInfo();
            });
        }

        throw e;
      });
  }

  private async _fetchInfo() {
    console.log('Fetching user info');

    return axios.get(`${this.somtodayApiUrl}/rest/v1/leerlingen`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })
      .then(infoResponse => {
        const { data } = infoResponse;
        const userInfo = data.items[0];

        this.id = userInfo.links[0].id;
        this.uuid = userInfo.UUID;
        this.pupilNumber = userInfo.leerlingnummer;
        this.firstName = userInfo.roepnaam;
        this.lastName = userInfo.achternaam;
        this.email = userInfo.email;
        this.mobileNumber = userInfo.mobielNummer;
        this.birthDate = new Date(userInfo.geboortedatum);
        this.gender = userInfo.geslacht;

        this._authenticatedResolver(true);
      });
  }

  private async _refreshToken(): Promise<boolean | void> {
    const body = {
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      scope: 'openid',
    };

    return axios.post('https://production.somtoday.nl/oauth2/token', qs.stringify(body), {
      auth: {
        username: APP_ID,
        password: APP_SECRET,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then(authResponse => {
        const { data } = authResponse;
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.idToken = data.id_token;

        return true;
      })
      .catch(e => {
        if (e.response.data.error === 'invalid_grant') {
          // todo: make this better
          this._authenticatedRejecter(new InvalidTokenError());
        }
      });
  }

}

export { User as default };
