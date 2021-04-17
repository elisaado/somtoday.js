import axios from "axios";
import Organisation from "./organisation";

import Fuse = require("fuse.js");
import { api_organisaties } from "./somtoday_api_types";

const fuseOptions = {
  isCaseSensitive: false,
  findAllMatches: false,
  includeMatches: false,
  includeScore: false,
  threshold: 0.8,
  keys: ["name"],
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
      .then((data: api_organisaties) =>
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
  async searchOrganisation(query: Query): Promise<Organisation | undefined> {
    const organizations = await this.getOrganizations(); /*.map((org) => {
      return { name: org.name, uuid: org.uuid, plaats: org.location, org: org };
    });*/
    if (query.uuid) {
      const foundOrganization = organizations.find(
        (organisation) => organisation.uuid === query.uuid,
      );
      return foundOrganization;
    }
    if (query.name) {
      const fuse = new Fuse(organizations, fuseOptions);
      const result = fuse.search(query.name);
      if (!result?.[0]?.item) return undefined;
      const organizationData = result[0].item;
      return organizationData;
    }

    throw new Error("No query provided");
  }
}

const SOM = new SOMToday();
export { SOM as default };
