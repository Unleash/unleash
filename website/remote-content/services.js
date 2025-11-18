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
        searchPriority: 'high',
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
            'docs/benchmarking.md': {
                sidebarName: 'Benchmarking',
                slugName: 'benchmarking',
            },
            'docs/CLI.md': {
                sidebarName: 'CLI',
                slugName: 'cli',
            },
            'docs/development-guide.md': {
                sidebarName: 'Development guide',
                slugName: 'development-guide',
            },
            'docs/migration-guide.md': {
                sidebarName: 'Migration guide',
                slugName: 'migration-guide',
            },
        },
    },
    'unleash-mcp': {
        sidebarName: 'MCP',
        slugName: 'mcp',
    },
});

const getAdmonitions = (data) => {
    const admonitions = {};

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
