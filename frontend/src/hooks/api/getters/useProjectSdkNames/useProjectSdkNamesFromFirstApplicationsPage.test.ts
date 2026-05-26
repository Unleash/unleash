import { describe, expect, it } from 'vitest';
import { extractSdkNames } from './useProjectSdkNamesFromFirstApplicationsPage';

const app = (sdkNames: string[]) => ({
    name: 'my-app',
    environments: [],
    instances: [],
    sdks: sdkNames.map((name) => ({ name, versions: [] })),
});

describe('extractSdkNames', () => {
    it('maps known package names to SdkNames', () => {
        expect(extractSdkNames([app(['unleash-client-node'])])).toEqual([
            'Node.js',
        ]);
    });

    it('deduplicates sdk names across apps and packages', () => {
        const apps = [
            app(['unleash-client-node']),
            app(['unleash-node-sdk', 'unleash-client-go']),
        ];
        expect(extractSdkNames(apps)).toEqual(['Node.js', 'Go']);
    });

    it('ignores unknown package names', () => {
        expect(extractSdkNames([app(['some-unknown-sdk'])])).toEqual([]);
    });

    it('returns [] for empty applications', () => {
        expect(extractSdkNames([])).toEqual([]);
    });
});
