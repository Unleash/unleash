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

    it.each([
        ['unleash-client-node', 'Node.js'],
        ['unleash-client-go', 'Go'],
        ['unleash-client-java', 'Java'],
        ['unleash-java-sdk', 'Java'],
        ['unleash-client-javascript', 'JavaScript'],
        ['unleash-proxy-client', 'JavaScript'],
        ['@unleash/proxy-client-react', 'React'],
        ['@unleash/proxy-client-vue', 'Vue'],
        ['@unleash/proxy-client-svelte', 'Svelte'],
        ['unleash-client-python', 'Python'],
        ['unleash-client-ruby', 'Ruby'],
        ['unleash-client-php', 'PHP'],
        ['unleash-client-dotnet', '.NET'],
        ['unleash-client-rust', 'Rust'],
        ['unleash-ios-sdk', 'Swift'],
        ['UnleashProxyClientSwift', 'Swift'],
        ['unleash-android-sdk', 'Android'],
        ['unleash_proxy_client_flutter', 'Flutter'],
    ])('maps %s to %s', (pkg, expected) => {
        expect(extractSdkNames([app([pkg])])).toEqual([expected]);
    });
});
