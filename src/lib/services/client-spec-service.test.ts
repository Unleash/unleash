import { ClientSpecService } from './client-spec-service';
import getLogger from '../../test/fixtures/no-logger';

test('ClientSpecService validation', async () => {
    const service = new ClientSpecService({ getLogger });
    expect(service.versionSupportsSpec('segments', undefined)).toEqual(false);
    expect(service.versionSupportsSpec('segments', '')).toEqual(false);
    expect(() => service.versionSupportsSpec('segments', 'a')).toThrow();
    expect(() => service.versionSupportsSpec('segments', '1.2')).toThrow();
    expect(() => service.versionSupportsSpec('segments', 'v1.2.3')).toThrow();
    expect(() => service.versionSupportsSpec('segments', '=1.2.3')).toThrow();
    expect(() => service.versionSupportsSpec('segments', '1.2.3.4')).toThrow();
});

test('ClientSpecService segments', async () => {
    const service = new ClientSpecService({ getLogger });
    expect(service.versionSupportsSpec('segments', '0.0.0')).toEqual(false);
    expect(service.versionSupportsSpec('segments', '1.0.0')).toEqual(false);
    expect(service.versionSupportsSpec('segments', '4.1.9')).toEqual(false);
    expect(service.versionSupportsSpec('segments', '4.2.0')).toEqual(true);
    expect(service.versionSupportsSpec('segments', '4.2.1')).toEqual(true);
    expect(service.versionSupportsSpec('segments', '5.0.0')).toEqual(true);
});
