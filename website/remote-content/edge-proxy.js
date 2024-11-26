import {
    enrich,
    mapObject,
    modifyContent,
    getRepoData,
    getUrls,
} from './shared';

const DOCS = mapObject(enrich)({
    'unleash-proxy': {
        sidebarName: 'Unleash Proxy',
        slugName: 'unleash-proxy',
    },
    'unleash-edge': {
        sidebarName: 'Unleash Edge',
        slugName: 'unleash-edge',
        subPages: {
            'docs/concepts.md': {
                sidebarName: 'Concepts',
                slugName: 'concepts',
            },
            'docs/deploying.md': {
                sidebarName: 'Deploying',
                slugName: 'deploying',
            },
        },
    },
});

const getAdmonitions = (data) => {
    const admonitions = {
        'unleash-proxy': ``,
        'unleash-edge': ``,
    };

    return [admonitions[data.slugName]];
};

const modifyContent2 = modifyContent({
    getRepoDataFn: getRepoData(DOCS),
    urlPath: '/reference/',
    getAdditionalAdmonitions: getAdmonitions,
});

export const docs = {
    urls: getUrls(DOCS),
    modifyContent: modifyContent2,
};
