import axios from 'axios';
import { Leerling } from './leerling';
import { Instelling } from './instelling';

class SOMToday {
  _serversBaseURL: string = 'https://servers.somtoday.nl';
  _authBaseURL: string = 'https://production.somtoday.nl';
  _baseURL: string;
  _accessToken: string;
  _refreshToken: string;
  _idToken: string;

  user: Leerling; // no parent support (yet?)
  organisation: Instelling;
  
}
