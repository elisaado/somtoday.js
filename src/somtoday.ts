import axios from "axios";
import Organisation from "./organisation";

import Fuse = require("fuse.js");

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
  keys: ["naam", "uuid"],
};

interface Query {
  name?: string;
  uuid?: string;
}

class SOMToday {
  organizationsURL: string = "https://servers.somtoday.nl/organisaties.json";

  // Retrieve all organizations
  async getOrganizations(): Promise<Array<Organisation>> {
    return axios
      .get(this.organizationsURL)
      .then((response) => response.data)
      .then((data) =>
        data[0].instellingen.map(
          (organisationInfo: any) =>
            new Organisation(
              organisationInfo.uuid,
              organisationInfo.naam,
              organisationInfo.plaats,
            ),
        ),
      );
  }

  // TODO
  // Make a function to retreive an array of organisations by name

  // Retreive a single organisation
  // Query can be (part of) an organisation name
  // It can also be its UUID
  async searchOrganisation(query: Query): Promise<Organisation> {
    return axios
      .get(this.organizationsURL)
      .then((response) => response.data)
      .then((data) => {
        const organizations = data[0].instellingen;
        if (query.uuid) {
          const organisationData = organizations.find(
            (organisation: any) => organisation.uuid === query.uuid,
          );

          return new Organisation(
            organisationData.uuid,
            organisationData.naam,
            organisationData.plaats,
          );
        }
        if (query.name) {
          const fuse = new Fuse(organizations, fuseOptions);

          const organisationData: any = fuse.search(query.name)[0].item;
          return new Organisation(
            organisationData.uuid,
            organisationData.naam,
            organisationData.plaats,
          );
        }

        throw new Error("No query provided");
      });
  }
}

const SOM = new SOMToday();
export { SOM as default };
