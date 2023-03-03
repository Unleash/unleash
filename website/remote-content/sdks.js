const {
    enrichAdditional,
    modifyContent,
    getRepoData,
    getUrls,
} = require('./shared');

// Type definitions
//
// type Readme = {
//     // This is the name that is placed before "SDK" in the sidebar.
//     sidebarName: string;
//
//     // The repo's primary branch. Falls back to "main" if nothing is defined
//     branch?: string;
//
//     // If present, this will be used to construct the slug. If no "slugName" is
//     // defined, the `sidebarName` will be used to create the slug.
//     slugName?: string;
// };
//
// type ReadmeData = Readme & { repoUrl: string };

const CLIENT_SIDE_SDK = 'client-side';
const SERVER_SIDE_SDK = 'server-side';

const serverSideSdks = {
    'unleash-client-go': {
        sidebarName: 'Go',
        branch: 'v3',
    },
    'unleash-client-java': {
        sidebarName: 'Java',
    },
    'unleash-client-node': {
        sidebarName: 'Node',
    },
    'unleash-client-php': {
        sidebarName: 'PHP',
    },
    'unleash-client-python': {
        sidebarName: 'Python',
    },
    'unleash-client-ruby': {
        sidebarName: 'Ruby',
    },
    'unleash-client-rust': {
        sidebarName: 'Rust',
    },
    'unleash-client-dotnet': {
        sidebarName: '.NET',
        slugName: 'dotnet',
    },
};

const clientSideSdks = {
    'unleash-android-proxy-sdk': {
        sidebarName: 'Android',
        slugName: 'android-proxy',
    },
    unleash_proxy_client_flutter: {
        sidebarName: 'Flutter',
    },
    'unleash-proxy-client-swift': {
        sidebarName: 'iOS',
        slugName: 'ios-proxy',
    },
    'unleash-proxy-client-js': {
        sidebarName: 'JavaScript browser',
        slugName: 'javascript-browser',
    },
    'proxy-client-react': {
        sidebarName: 'React',
    },
    'proxy-client-svelte': {
        sidebarName: 'Svelte',
    },
    'proxy-client-vue': {
        sidebarName: 'Vue',
    },
    'unleash-client-nextjs': {
        sidebarName: 'Next.js',
        slugName: 'next-js',
    },
};

const SDKS = (() => {
    const serverSide = Object.entries(serverSideSdks).map(
        enrichAdditional({ type: SERVER_SIDE_SDK }),
    );
    const clientSide = Object.entries(clientSideSdks).map(
        enrichAdditional({ type: CLIENT_SIDE_SDK }),
    );

    return Object.fromEntries(serverSide.concat(clientSide));
})();

const getAdmonitions = (sdk) => {
    const admonitions = {
        [CLIENT_SIDE_SDK]: `To connect to Unleash from a client-side context, you'll need to use the [Unleash front-end API](/reference/front-end-api) ([how do I create an API token?](/how-to/how-to-create-api-tokens.mdx)) or the [Unleash proxy](/reference/unleash-proxy) ([how do I create client keys?](/reference/api-tokens-and-client-keys#proxy-client-keys)).`,
        [SERVER_SIDE_SDK]: `To connect to Unleash, you'll need your Unleash API url (e.g. \`https://<your-unleash>/api\`) and a [server-side API token](/reference/api-tokens-and-client-keys.mdx#client-tokens) ([how do I create an API token?](/how-to/how-to-create-api-tokens.mdx)).`,
    };

    const wrap = (text) => `:::tip\n${text}\n:::`;

    return [wrap(admonitions[sdk.type])];
};

const modifyContent2 = modifyContent({
    getRepoDataFn: getRepoData(SDKS),
    urlPath: '/reference/sdks',
    filePath: (sdk) => `sdks/${sdk.type}`,
    getAdditionalAdmonitions: getAdmonitions,
});

module.exports.sdks = {
    urls: getUrls(SDKS),
    modifyContent: modifyContent2,
};
