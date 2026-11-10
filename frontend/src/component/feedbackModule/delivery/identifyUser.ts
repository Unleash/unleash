import type { IContext } from 'unleash-proxy-client';

export type IdentifyUser = (context: IContext) => string | undefined;

// User ids are only unique within one instance, so the instance's clientId
// makes the respondent unique across all instances reporting to us.
export const identifyUser: IdentifyUser = ({ userId, properties }) => {
    const clientId = properties?.clientId;
    if (!clientId || !userId) {
        return undefined;
    }
    return `${clientId}:${userId}`;
};
