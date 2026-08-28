import android from 'assets/icons/sdks/Logo-android.svg';
import dotnet from 'assets/icons/sdks/Logo-net.svg';
import flutter from 'assets/icons/sdks/Logo-flutter.svg';
import go from 'assets/icons/sdks/Logo-go.svg';
import java from 'assets/icons/sdks/Logo-java.svg';
import javascript from 'assets/icons/sdks/Logo-javascript.svg';
import nextjs from 'assets/icons/sdks/Logo-nextjs.svg';
import node from 'assets/icons/sdks/Logo-node.svg';
import php from 'assets/icons/sdks/Logo-php.svg';
import python from 'assets/icons/sdks/Logo-python.svg';
import react from 'assets/icons/sdks/Logo-react.svg';
import reactnative from 'assets/icons/sdks/Logo-reactnative.svg';
import ruby from 'assets/icons/sdks/Logo-ruby.svg';
import rust from 'assets/icons/sdks/Logo-rust.svg';
import svelte from 'assets/icons/sdks/Logo-svelte.svg';
import swift from 'assets/icons/sdks/Logo-swift.svg';
import vue from 'assets/icons/sdks/Logo-vue.svg';

export const SDK_ICONS = {
    android: { icon: android, title: 'Android' },
    dotnet: { icon: dotnet, title: '.NET' },
    flutter: { icon: flutter, title: 'Flutter' },
    go: { icon: go, title: 'Go' },
    java: { icon: java, title: 'Java' },
    javascript: { icon: javascript, title: 'JavaScript' },
    nextjs: { icon: nextjs, title: 'Next.js' },
    node: { icon: node, title: 'Node.js' },
    php: { icon: php, title: 'PHP' },
    python: { icon: python, title: 'Python' },
    react: { icon: react, title: 'React' },
    reactnative: { icon: reactnative, title: 'React Native' },
    ruby: { icon: ruby, title: 'Ruby' },
    rust: { icon: rust, title: 'Rust' },
    svelte: { icon: svelte, title: 'Svelte' },
    swift: { icon: swift, title: 'Swift' },
    vue: { icon: vue, title: 'Vue' },
} as const;

export type OfficialSdkName = keyof typeof SDK_ICONS;
export type SdkName = (typeof SDK_ICONS)[OfficialSdkName]['title'];

export interface Sdk {
    name: OfficialSdkName;
    displayName: string;
    description: string;
    documentationUrl: string;
    type: 'server' | 'client';
}

export const OFFICIAL_SDKS = [
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
        documentationUrl: 'https://docs.getunleash.io/sdks/android',
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
        documentationUrl: 'https://docs.getunleash.io/sdks/ios',
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
    {
        name: 'nextjs',
        displayName: 'Next.js SDK',
        description: 'Official Unleash Client for Next.js',
        documentationUrl: 'https://docs.getunleash.io/sdks/next-js',
        type: 'client',
    },
    {
        name: 'reactnative',
        displayName: 'React Native SDK',
        description: 'Official Unleash Client for React Native',
        documentationUrl: 'https://docs.getunleash.io/sdks/react-native',
        type: 'client',
    },
] as const satisfies Sdk[];
