import Addon from '../addons/addon';
import getLogger from '../../test/fixtures/no-logger';
import { IAddonDefinition } from '../types/model';
import {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_REVIVED,
    FEATURE_UPDATED,
    IEvent,
} from '../types/events';

const definition: IAddonDefinition = {
    name: 'simple',
    displayName: 'Simple ADdon',
    description: 'Some description',
    parameters: [
        {
            name: 'url',
            displayName: 'Some URL',
            type: 'url',
            required: true,
            sensitive: false,
        },
        {
            name: 'var',
            displayName: 'Some var',
            description: 'Some variable to inject',
            type: 'text',
            required: false,
            sensitive: false,
        },
        {
            name: 'sensitiveParam',
            displayName: 'Some sensitive param',
            description: 'Some variable to inject',
            type: 'text',
            required: false,
            sensitive: true,
        },
    ],
    documentationUrl: 'https://www.example.com',
    events: [
        FEATURE_CREATED,
        FEATURE_UPDATED,
        FEATURE_ARCHIVED,
        FEATURE_REVIVED,
    ],
    tagTypes: [
        {
            name: 'me',
            description: 'Some tag',
            icon: 'm',
        },
    ],
};
export default class SimpleAddon extends Addon {
    events: any[];

    constructor() {
        super(definition, { getLogger });
        this.events = [];
    }

    getEvents(): any[] {
        return this.events;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleEvent(event: IEvent, parameters: any): Promise<void> {
        this.events.push({
            event,
            parameters,
        });
    }
}
