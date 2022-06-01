import { ClientSpecService } from './client-spec-service';
import getLogger from '../../test/fixtures/no-logger';

test('ClientSpecService validation', async () => {
    const service = new ClientSpecService({ getLogger });
    const fn = service.versionSupportsSpec.bind(service);

    expect(fn('segments', undefined)).toEqual(false);
    expect(fn('segments', '')).toEqual(false);

    expect(() => fn('segments', 'a')).toThrow('Invalid prefix');
    expect(() => fn('segments', '1.2')).toThrow('Invalid SemVer');
    expect(() => fn('segments', 'v1.2.3')).toThrow('Invalid prefix');
    expect(() => fn('segments', '=1.2.3')).toThrow('Invalid prefix');
    expect(() => fn('segments', '1.2.3.4')).toThrow('Invalid SemVer');
});

test('ClientSpecService segments', async () => {
    const service = new ClientSpecService({ getLogger });
    const fn = service.versionSupportsSpec.bind(service);

    expect(fn('segments', '0.0.0')).toEqual(false);
    expect(fn('segments', '1.0.0')).toEqual(false);
    expect(fn('segments', '4.1.9')).toEqual(false);

    expect(fn('segments', '4.2.0')).toEqual(true);
    expect(fn('segments', '4.2.1')).toEqual(true);
    expect(fn('segments', '5.0.0')).toEqual(true);
});
