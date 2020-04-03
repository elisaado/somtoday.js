import axios from 'axios';
import { Organisation } from './organisation';

import Fuse = require('fuse.js');

interface AuthenticatedArgs {
  accessToken: string,
  refreshToken: string,
  idToken: string,
  baseURL: string
}

interface Query {
  name: string,
  uuid: string
}

class SOMToday {
  _serversBaseURL: string = 'https://servers.somtoday.nl';

  // Retrieve all organisations
  async getOrganisations() {
    return axios.get(`${this._serversBaseURL}/organisaties.json`)
    .then(response => response.data)
    .then(data => data[0].instellingen.map((organisationInfo: any) => {
      return new Organisation(
        organisationInfo.uuid,
        organisationInfo.naam,
        organisationInfo.plaats,
      );
    }));
  }

  // TODO
  // Retreive a single organisation
  searchOrganisation(query: Query) {

  }
}
