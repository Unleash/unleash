import { normalizeTopLevelPath } from './useInitialPathname.js';

test('normalization test', () => {
    expect(normalizeTopLevelPath('/')).toBe('/projects');
    expect(normalizeTopLevelPath('')).toBe('/projects');
    expect(normalizeTopLevelPath('/admin')).toBe('/projects');
    expect(normalizeTopLevelPath('/admin/test')).toBe('/admin/test');
    expect(normalizeTopLevelPath('/projects')).toBe('/projects');
    expect(normalizeTopLevelPath('/projects/default')).toBe('/projects');
    expect(normalizeTopLevelPath('/projects/default/test')).toBe('/projects');
    expect(normalizeTopLevelPath('/insights/default/test')).toBe('/insights');
    expect(normalizeTopLevelPath('/admin/networks/test')).toBe(
        '/admin/networks',
    );
    expect(normalizeTopLevelPath('/admin/networks/test/another')).toBe(
        '/admin/networks',
    );
});
