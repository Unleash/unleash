import Webhook from './webhook';
import SlackAddon from './slack';
import TeamsAddon from './teams';
import DatadogAddon from './datadog';
import NewRelicAddon from './new-relic';
import type Addon from './addon';
import SlackAppAddon from './slack-app';
import type { IAddonConfig } from '../types';

export interface IAddonProviders {
    [key: string]: Addon;
}

export const getAddons: (args: IAddonConfig) => IAddonProviders = (args) => {
    const addons: Addon[] = [
        new Webhook(args),
        new SlackAddon(args),
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
