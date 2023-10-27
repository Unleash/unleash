import Webhook from './webhook';
import SlackAddon from './slack';
import TeamsAddon from './teams';
import DatadogAddon from './datadog';
import Addon from './addon';
import { LogProvider } from '../logger';
import SlackAppAddon from './slack-app';
import { IFlagResolver } from '../types';

export interface IAddonProviders {
    [key: string]: Addon;
}

export const getAddons: (args: {
    getLogger: LogProvider;
    unleashUrl: string;
    flagResolver: IFlagResolver;
}) => IAddonProviders = ({ getLogger, unleashUrl, flagResolver }) => {
    const addons: Addon[] = [
        new Webhook({ getLogger }),
        new SlackAddon({ getLogger, unleashUrl }),
        new SlackAppAddon({ getLogger, unleashUrl }),
        new TeamsAddon({ getLogger, unleashUrl }),
        new DatadogAddon({ getLogger, unleashUrl }),
    ];

    return addons.reduce((map, addon) => {
        // eslint-disable-next-line no-param-reassign
        map[addon.name] = addon;
        return map;
    }, {});
};
