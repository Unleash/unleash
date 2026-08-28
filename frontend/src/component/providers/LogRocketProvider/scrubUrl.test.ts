import { describe, expect, it } from 'vitest';
import { scrubUrl, scrubBrowserUrl, isStaticAsset } from './scrubUrl';

describe('scrubUrl', () => {
    it('masks segments after the first 3 character-by-character', () => {
        expect(
            scrubUrl('/api/admin/projects/my-project/features/my-flag'),
        ).toBe('/api/admin/projects/**********/********/*******');
    });

    it('masks query param values, preserving keys', () => {
        expect(scrubUrl('/api/admin/features?project=foo&tag=bar')).toBe(
            '/api/admin/features?project=***&tag=***',
        );
    });

    it('keeps the host for absolute URLs', () => {
        expect(
            scrubUrl('https://app.getunleash.io/api/admin/projects/secret'),
        ).toBe('https://app.getunleash.io/api/admin/projects/******');
    });

    it('returns what is available when path has fewer than 3 segments', () => {
        expect(scrubUrl('/api/admin')).toBe('/api/admin');
        expect(scrubUrl('/api')).toBe('/api');
    });

    it('returns / for root path', () => {
        expect(scrubUrl('/')).toBe('/');
    });

    it('returns exactly 3 segments unchanged when path has exactly 3', () => {
        expect(scrubUrl('/api/admin/features')).toBe('/api/admin/features');
    });

    it('respects custom depth parameter', () => {
        // depth=2: keep 'api' and 'admin', mask everything after
        expect(
            scrubUrl('/api/admin/projects/my-project/features/my-flag', 2),
        ).toBe('/api/admin/********/**********/********/*******');
    });
});

describe('scrubBrowserUrl', () => {
    it('scrubs navigation URLs with depth 2', () => {
        expect(
            scrubBrowserUrl(
                'https://us.app.getunleash.io/someInstance12/projects/default/features/Some_Flag',
            ),
        ).toBe(
            'https://us.app.getunleash.io/someInstance12/projects/*******/********/*********',
        );
    });
});

describe('isStaticAsset', () => {
    it('detects static file extensions', () => {
        expect(
            isStaticAsset(
                'https://cdn.getunleash.io/unleash/v7.6.5/static/style-ABC.css',
            ),
        ).toBe(true);
        expect(
            isStaticAsset(
                'https://cdn.getunleash.io/unleash/v7.6.5/static/FlagMetricsChart-123456.js',
            ),
        ).toBe(true);
        expect(
            isStaticAsset(
                'https://sandbox.getunleash.io/enterprise/static/logo-BbvuC13D.gif',
            ),
        ).toBe(true);
        expect(
            isStaticAsset(
                'https://sandbox.getunleash.io/enterprise/static/texture.png',
            ),
        ).toBe(true);
        expect(
            isStaticAsset(
                'https://fonts.gstatic.com/s/sen/v12/some_file.woff2',
            ),
        ).toBe(true);
    });

    it('detects /static/ path segment without file extension', () => {
        expect(
            isStaticAsset(
                'https://cdn.getunleash.io/unleash/v7.6.5/static/somechunk',
            ),
        ).toBe(true);
    });

    it('detects font service domains', () => {
        expect(
            isStaticAsset(
                'https://fonts.googleapis.com/css2?family=Sen:wght@400;500;700;800&display=swap',
            ),
        ).toBe(true);
    });

    it('returns false for API and navigation URLs', () => {
        expect(
            isStaticAsset(
                'https://eu.app.getunleash.io/api/admin/projects/default/features/my-flag',
            ),
        ).toBe(false);
        expect(
            isStaticAsset(
                'https://eu.app.getunleash.io/eull0626/projects/default/features/Some_Flag',
            ),
        ).toBe(false);
    });
});
