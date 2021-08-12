import {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_STALE_ON,
    FEATURE_STALE_OFF,
} from '../types/events';
import { IAddonDefinition } from '../types/model';

const teamsDefinition: IAddonDefinition = {
    name: 'teams',
    displayName: 'Microsoft Teams',
    description: 'Allows Unleash to post updates to Microsoft Teams.',
    documentationUrl: 'https://docs.getunleash.io/docs/addons/teams',
    parameters: [
        {
            name: 'url',
            displayName: 'Microsoft Teams webhook URL',
            type: 'url',
            required: true,
            sensitive: true,
        },
    ],
    events: [
        FEATURE_CREATED,
        FEATURE_UPDATED,
        FEATURE_ARCHIVED,
        FEATURE_REVIVED,
        FEATURE_STALE_ON,
        FEATURE_STALE_OFF,
    ],
};

export default teamsDefinition;
