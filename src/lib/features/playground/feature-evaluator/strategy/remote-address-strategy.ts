import { Strategy } from "./strategy";
import type { Context } from "../context";
import { Address4 } from "ip-address";

export default class RemoteAddressStrategy extends Strategy {
  constructor() {
    super("remoteAddress");
  }

  isEnabled(parameters: { IPs?: string }, context: Context): boolean {
    if (!parameters.IPs) {
      return false;
    }
    return parameters.IPs.split(/\s*,\s*/).some((range: string): Boolean => {
      if (range === context.remoteAddress) {
        return true;
      }
      if (Address4.isValid(range)) {
        try {
          const subnetRange = new Address4(range);
          const remoteAddress = new Address4(context.remoteAddress || "");
          return remoteAddress.isInSubnet(subnetRange);
        } catch (err) {
          return false;
        }
      }
    });
  }
}
