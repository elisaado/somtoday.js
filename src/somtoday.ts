import axios from 'axios';
import { Leerling } from './leerling';
import { Instelling } from './instelling';

interface AuthenticatedArgs {
  accessToken: string,
  refreshToken: string,
  idToken: string,
  baseURL: string
}

class SOMToday {
  _serversBaseURL: string = 'https://servers.somtoday.nl';
  _authBaseURL: string = 'https://production.somtoday.nl';
  _baseURL: string;
  _accessToken: string;
  _refreshToken: string;
  _idToken: string;

  user: Leerling; // no parent support (yet?)
  organisation: Instelling;

  _authenticated: boolean;
  
  constructor(args: AuthenticatedArgs) {
    // check if token is valid
    this._accessToken = args.accessToken;
    this._refreshToken = args.refreshToken;
    this._idToken = args.idToken;
    this._baseURL = args.baseURL;

    // this.getStudents()
    // if success: authenticated = true
    // if fail:
    // refresh token
    // if refresh fail:
    // authenticated stays false (and returns error?)
  }
}
