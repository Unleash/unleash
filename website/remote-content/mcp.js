import {
    enrich,
    mapObject,
    modifyContent,
    getRepoData,
    getUrls,
} from './shared';

const DOCS = mapObject(enrich)({
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
