import Webhook from './webhook.js';
import TeamsAddon from './teams.js';
import DatadogAddon from './datadog.js';
import NewRelicAddon from './new-relic.js';
import type Addon from './addon.js';
import SlackAppAddon from './slack-app.js';
import type { IAddonConfig } from '../types/index.js';
import SlackAddon from './slack.js';

export interface IAddonProviders {
    [key: string]: Addon;
}

export const getAddons: (args: IAddonConfig) => IAddonProviders = (args) => {
    const addons: Addon[] = [
        new Webhook(args),
        new SlackAddon(args), // TODO: remove this as soon as all clients (currently 12) migrate to SlackApp
        new SlackAppAddon(args),
        new TeamsAddon(args),
        new DatadogAddon(args),
        new NewRelicAddon(args),
    ];

    return addons.reduce((map, addon) => {
        // eslint-disable-next-line no-param-reassign
        map[addon.name] = addon;
        return map;
    }, {});
};
