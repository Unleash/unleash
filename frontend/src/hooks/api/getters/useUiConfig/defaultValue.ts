import { LibraryBooks } from '@mui/icons-material';
import { IUiConfig } from 'interfaces/uiConfig';

export const defaultValue: IUiConfig = {
    name: 'Unleash',
    version: '3.x',
    versionInfo: {
        instanceId: '',
        isLatest: true,
        latest: {},
        current: {
            oss: 'false',
            enterprise: 'true',
        }
    },
    slogan: 'The enterprise ready feature toggle service.',
    flags: {
        P: false,
        RE: false,
        EEA: false,
        SE: false,
        T: false,
        UNLEASH_CLOUD: false,
        UG: false,
    },
    links: [
        {
            value: 'Documentation',
            icon: LibraryBooks,
            href: 'https://docs.getunleash.io/docs?source=oss',
            title: 'User documentation',
        },
        {
            value: 'GitHub',
            icon: 'c_github',
            href: 'https://github.com/Unleash',
            title: 'Source code on GitHub',
        },
    ],
    networkViewEnabled: false,
};
