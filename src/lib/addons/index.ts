import Webhook from './webhook';
import SlackAddon from './slack';
import TeamsAddon from './teams';
import DatadogAddon from './datadog';
import Addon from './addon';
import { LogProvider } from '../logger';

export interface IAddonProviders {
    [key: string]: Addon;
}

export const getAddons: (args: {
    getLogger: LogProvider;
    unleashUrl: string;
    newFeatureLink?: boolean;
}) => IAddonProviders = ({ getLogger, unleashUrl }) => {
    const addons = [
        new Webhook({ getLogger }),
        new SlackAddon({ getLogger, unleashUrl }),
        new TeamsAddon({ getLogger, unleashUrl }),
        new DatadogAddon({ getLogger, unleashUrl }),
    ];
    return addons.reduce((map, addon) => {
        // eslint-disable-next-line no-param-reassign
        map[addon.name] = addon;
        return map;
    }, {});
};
