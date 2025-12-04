export interface Sdk {
    name: string;
    displayName: string;
    description: string;
    documentationUrl: string;
    type: 'server' | 'client';
}

export const OFFICIAL_SDKS: Sdk[] = [
    {
        name: 'go',
        displayName: 'GO SDK',
        description: 'Official Unleash Client for Go',
        documentationUrl: 'https://docs.getunleash.io/sdks/go',
        type: 'server',
    },
    {
        name: 'java',
        displayName: 'Java SDK',
        description: 'Official Unleash Client for Java',
        documentationUrl: 'https://docs.getunleash.io/sdks/java',
        type: 'server',
    },
    {
        name: 'node',
        displayName: 'Node.js SDK',
        description: 'Official Unleash Client for Node.js',
        documentationUrl: 'https://docs.getunleash.io/sdks/node',
        type: 'server',
    },
    {
        name: 'php',
        displayName: 'PHP SDK',
        description: 'Official Unleash Client for PHP',
        documentationUrl: 'https://docs.getunleash.io/sdks/php',
        type: 'server',
    },
    {
        name: 'python',
        displayName: 'Python SDK',
        description: 'Official Unleash Client for Python',
        documentationUrl: 'https://docs.getunleash.io/sdks/python',
        type: 'server',
    },
    {
        name: 'ruby',
        displayName: 'Ruby SDK',
        description: 'Official Unleash Client for Ruby',
        documentationUrl: 'https://docs.getunleash.io/sdks/ruby',
        type: 'server',
    },
    {
        name: 'rust',
        displayName: 'Rust SDK',
        description: 'Official Unleash Client for Rust',
        documentationUrl: 'https://docs.getunleash.io/sdks/rust',
        type: 'server',
    },
    {
        name: 'dotnet',
        displayName: '.NET SDK',
        description: 'Official Unleash Client for .NET',
        documentationUrl: 'https://docs.getunleash.io/sdks/dotnet ',
        type: 'server',
    },
    {
        name: 'android',
        displayName: 'Android SDK',
        description: 'Official Unleash Client for Android',
        documentationUrl: 'https://docs.getunleash.io/sdks/android-proxy',
        type: 'client',
    },
    {
        name: 'flutter',
        displayName: 'Flutter Proxy SDK',
        description: 'Official Unleash Client for Flutter',
        documentationUrl: 'https://docs.getunleash.io/sdks/flutter',
        type: 'client',
    },
    {
        name: 'swift',
        displayName: 'Swift Proxy SDK',
        description: 'Official Unleash Client for iOS',
        documentationUrl: 'https://docs.getunleash.io/sdks/ios-proxy',
        type: 'client',
    },
    {
        name: 'javascript',
        displayName: 'Javascript Proxy SDK',
        description: 'Official Unleash Client for Javascript',
        documentationUrl: 'https://docs.getunleash.io/sdks/javascript-browser',
        type: 'client',
    },
    {
        name: 'react',
        displayName: 'React Proxy SDK',
        description: 'Official Unleash Client for React',
        documentationUrl: 'https://docs.getunleash.io/sdks/react',
        type: 'client',
    },
    {
        name: 'svelte',
        displayName: 'Svelte Proxy SDK',
        description: 'Official Unleash Client for Svelte',
        documentationUrl: 'https://docs.getunleash.io/sdks/svelte',
        type: 'client',
    },
    {
        name: 'vue',
        displayName: 'Vue Proxy SDK',
        description: 'Official Unleash Client for Vue',
        documentationUrl: 'https://docs.getunleash.io/sdks/vue',
        type: 'client',
    },
];
