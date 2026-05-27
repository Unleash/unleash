import { describe, expect, it } from 'vitest';
import { extractSdkNames } from './useProjectSdkNamesFromFirstApplicationsPage';

const app = (sdkNames: string[]) => ({
    name: 'my-app',
    environments: [],
    instances: [],
    sdks: sdkNames.map((name) => ({ name, versions: [] })),
});

describe('extractSdkNames', () => {
    it('returns [] for empty applications', () => {
        expect(extractSdkNames([])).toEqual([]);
    });

    it('ignores unknown package names', () => {
        expect(extractSdkNames([app(['some-unknown-sdk'])])).toEqual([]);
    });

    it('deduplicates sdk names across apps and packages', () => {
        const apps = [
            app(['unleash-client-node']),
            app(['unleash-node-sdk', 'unleash-client-go']),
        ];
        expect(extractSdkNames(apps)).toEqual(['Node.js', 'Go']);
    });

    describe('ordering: java vs javascript', () => {
        it('matches javascript packages to JavaScript, not Java', () => {
            expect(
                extractSdkNames([app(['unleash-client-javascript'])]),
            ).toEqual(['JavaScript']);
        });

        it('still matches java packages to Java', () => {
            expect(extractSdkNames([app(['unleash-client-java'])])).toEqual([
                'Java',
            ]);
            expect(extractSdkNames([app(['unleash-java-sdk'])])).toEqual([
                'Java',
            ]);
        });
    });

    describe('ordering: react/vue/svelte before proxy-client', () => {
        it('matches @unleash/proxy-client-react to React', () => {
            expect(
                extractSdkNames([app(['@unleash/proxy-client-react'])]),
            ).toEqual(['React']);
        });

        it('matches @unleash/proxy-client-vue to Vue', () => {
            expect(
                extractSdkNames([app(['@unleash/proxy-client-vue'])]),
            ).toEqual(['Vue']);
        });

        it('matches @unleash/proxy-client-svelte to Svelte', () => {
            expect(
                extractSdkNames([app(['@unleash/proxy-client-svelte'])]),
            ).toEqual(['Svelte']);
        });

        it('matches unleash-proxy-client to JavaScript', () => {
            expect(extractSdkNames([app(['unleash-proxy-client'])])).toEqual([
                'JavaScript',
            ]);
        });
    });

    describe('swift / ios', () => {
        it('matches unleash-ios-sdk to Swift', () => {
            expect(extractSdkNames([app(['unleash-ios-sdk'])])).toEqual([
                'Swift',
            ]);
        });

        it('matches UnleashProxyClientSwift to Swift (case-insensitive)', () => {
            expect(extractSdkNames([app(['UnleashProxyClientSwift'])])).toEqual(
                ['Swift'],
            );
        });

        it('matches unleash-client-swift to Swift', () => {
            expect(extractSdkNames([app(['unleash-client-swift'])])).toEqual([
                'Swift',
            ]);
        });
    });

    describe('mobile sdks', () => {
        it('matches android packages to Android', () => {
            expect(extractSdkNames([app(['unleash-android'])])).toEqual([
                'Android',
            ]);
            expect(extractSdkNames([app(['unleash-android-sdk'])])).toEqual([
                'Android',
            ]);
        });

        it('matches flutter packages to Flutter', () => {
            expect(
                extractSdkNames([app(['unleash_proxy_client_flutter'])]),
            ).toEqual(['Flutter']);
            expect(extractSdkNames([app(['unleash-flutter-sdk'])])).toEqual([
                'Flutter',
            ]);
        });
    });

    describe('rust', () => {
        it('matches unleash-client-rust to Rust', () => {
            expect(extractSdkNames([app(['unleash-client-rust'])])).toEqual([
                'Rust',
            ]);
        });
    });
});
