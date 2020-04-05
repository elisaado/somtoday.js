import axios from 'axios';
import { Organisation } from './organisation';

import Fuse = require('fuse.js');

const fuseOptions = {
  isCaseSensitive: false,
  findAllMatches: false,
  includeMatches: false,
  includeScore: false,
  useExtendedSearch: false,
  minMatchCharLength: 1,
  shouldSort: true,
  threshold: 0,
  location: 0,
  distance: 100,
  keys: [
    'naam',
    'uuid',
  ],
};

interface Query {
  name?: string,
  uuid?: string
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

  // Retreive a single organisation
  // Query can be (part of) an organisation name
  // It can also be its UUID
  searchOrganisation(query: Query) {
    return axios.get(`${this._serversBaseURL}/organisaties.json`)
      .then((response) => response.data)
      .then((data) => {
        const organisations = data[0].instellingen;
        if (query.uuid) {
          const organisationData = organisations.find((organisation: any) => {
            return organisation.uuid === query.uuid;
          });

          return new Organisation(
            organisationData.uuid,
            organisationData.naam,
            organisationData.plaats,
          );
        }
        if (query.name) {
          const fuse = new Fuse(organisations, fuseOptions);

          const organisationData: any = fuse.search(query.name)[0].item;
          return new Organisation(
            organisationData.uuid,
            organisationData.naam,
            organisationData.plaats,
          );
        }

        throw new Error('No query provided');
      });
  }
}
