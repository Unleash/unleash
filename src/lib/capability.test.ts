import { clientHasCapability } from './capability';
import semver from 'semver';

test('clientHasCapability segments', async () => {
    expect(
        clientHasCapability(
            'segments',
            'unleash-client-node',
            semver.parse('3.13.0'),
        ),
    ).toEqual(false);
    expect(
        clientHasCapability(
            'segments',
            'unleash-client-node',
            semver.parse('3.14.0'),
        ),
    ).toEqual(true);
    expect(
        clientHasCapability(
            'segments',
            'unleash-client-node',
            semver.parse('4.0.0'),
        ),
    ).toEqual(true);
    expect(
        clientHasCapability(
            'segments',
            'unleash-client-go',
            semver.parse('1.0.0'),
        ),
    ).toEqual(false);
    expect(
        clientHasCapability(
            'segments',
            'unleash-client-go',
            semver.parse('3.5.0'),
        ),
    ).toEqual(false);
});
