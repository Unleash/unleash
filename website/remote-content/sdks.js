import {
    enrichAdditional,
    modifyContent,
    getRepoData,
    getUrls,
} from './shared';

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

const FRONTEND_SDKS = 'frontend';
const BACKEND_SDKS = 'backend';

const backendSdks = {
    'unleash-go-sdk': {
        sidebarName: 'Go',
        branch: 'v5',
    },
    'unleash-java-sdk': {
        sidebarName: 'Java',
    },
    'unleash-node-sdk': {
        sidebarName: 'Node',
    },
    'unleash-php-sdk': {
        sidebarName: 'PHP',
    },
    'unleash-python-sdk': {
        sidebarName: 'Python',
    },
    'unleash-ruby-sdk': {
        sidebarName: 'Ruby',
    },
    'unleash-rust-sdk': {
        sidebarName: 'Rust',
    },
    'unleash-dotnet-sdk': {
        sidebarName: '.NET',
        slugName: 'dotnet',
    },
};

const frontendSdks = {
    'unleash-android-proxy-sdk': {
        sidebarName: 'Android (legacy)',
        slugName: 'android-proxy-legacy',
    },
    'unleash-android-sdk': {
        sidebarName: 'Android',
        slugName: 'android',
    },
    'unleash-flutter-sdk': {
        sidebarName: 'Flutter',
    },
    'unleash-ios-sdk': {
        sidebarName: 'iOS',
        slugName: 'ios',
    },
    'unleash-js-sdk': {
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
    'unleash-nextjs-sdk': {
        sidebarName: 'Next.js',
        slugName: 'next-js',
    },
};

const SDKS = (() => {
    const serverSide = Object.entries(backendSdks).map(
        enrichAdditional({ type: BACKEND_SDKS }),
    );
    const clientSide = Object.entries(frontendSdks).map(
        enrichAdditional({ type: FRONTEND_SDKS }),
    );

    return Object.fromEntries(serverSide.concat(clientSide));
})();

const getAdmonitions = (sdk) => {
    const admonitions = {
        [FRONTEND_SDKS]: `To connect to Unleash from a frontend application, you'll need to use the [Unleash front-end API](/reference/front-end-api) ([how do I create an API token?](/guides/how-to-create-api-tokens.mdx)) or the [Unleash proxy](/reference/unleash-proxy) ([how do I create client keys?](/reference/api-tokens-and-client-keys#proxy-client-keys)).`,
        [BACKEND_SDKS]: `To connect to Unleash, you'll need your Unleash API url (e.g. \`https://<your-unleash>/api\`) and a [backend API token](/reference/api-tokens-and-client-keys.mdx#backend-tokens) ([how do I create an API token?](/guides/how-to-create-api-tokens.mdx)).`,
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

export const sdks = {
    urls: getUrls(SDKS),
    modifyContent: modifyContent2,
};
