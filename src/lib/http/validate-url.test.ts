import type { LookupAddress } from 'node:dns';
import http from 'node:http';
import { describe, expect, test, vi } from 'vitest';
import { fetchPinned } from './fetch.js';
import {
    NonPublicAddressError,
    urlWithPath,
    validateUrl,
    type ValidatedUrl,
} from './validate-url.js';
import WebhookAddon from '../addons/webhook.js';
import type { IAddonConfig, IFlagKey, IFlagResolver } from '../types/index.js';
import noLogger from '../../test/fixtures/no-logger.js';
import type { IntegrationEventsService } from '../features/integration-events/integration-events-service.js';
import EventEmitter from 'events';

const makeValidatedUrl = (
    rawUrl: string,
    pinnedAddress: string,
    family: 4 | 6 = 4,
): ValidatedUrl => {
    const url = new URL(rawUrl);

    return {
        url,
        hostname: url.hostname.toLowerCase(),
        pinnedAddress,
        family,
    };
};

const withHttpServer = async (
    handler: http.RequestListener,
    testFn: (port: number) => Promise<void>,
): Promise<void> => {
    const server = http.createServer(handler);
    server.keepAliveTimeout = 1;
    server.headersTimeout = 2000;
    await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', resolve);
    });

    const address = server.address();

    if (!address || typeof address === 'string') {
        throw new Error('Expected TCP server address');
    }

    try {
        await testFn(address.port);
    } finally {
        server.closeAllConnections();

        await new Promise<void>((resolve) => {
            server.close(() => resolve());
        });
    }
};
const createAddon = () => {
    const registerEventMock = vi.fn();
    const addonConfig: IAddonConfig = {
        getLogger: noLogger,
        unleashUrl: 'http://example.com',
        integrationEventsService: {
            registerEvent: registerEventMock,
        } as unknown as IntegrationEventsService,
        flagResolver: {
            isEnabled: (_expName: IFlagKey) => false,
        } as IFlagResolver,
        eventBus: new EventEmitter(),
    };
    return new WebhookAddon(addonConfig);
};

describe('fetchPinned', () => {
    test('connects to the pinned address while preserving the original Host header', async () => {
        let expectedHostheader: string;
        await withHttpServer(
            (req, res) => {
                expect(req.headers.host).toBe(expectedHostheader);
                res.statusCode = 200;
                res.end('ok');
            },
            async (port) => {
                expectedHostheader = `example.test:${port}`;
                const validated = makeValidatedUrl(
                    `http://example.test:${port}`,
                    '127.0.0.1',
                );

                const response = await fetchPinned(validated, {
                    retry: 0,
                });

                expect(response.status).toBe(200);
                expect(await response.text()).toBe('ok');
            },
        );
    });

    test('does not follow redirects', async () => {
        await withHttpServer(
            (_req, res) => {
                res.statusCode = 302;
                res.setHeader(
                    'location',
                    'http://169.254.169.254/latest/meta-data',
                );
                res.end();
            },
            async (port) => {
                const validated = makeValidatedUrl(
                    `http://example.test:${port}`,
                    '127.0.0.1',
                );

                const response = await fetchPinned(validated, {
                    retry: 0,
                });
                await response.body?.cancel();
                expect(response.status).toBe(302);
                expect(response.headers.get('location')).toBe(
                    'http://169.254.169.254/latest/meta-data',
                );
            },
        );
    });

    test('caller cannot override redirect handling', async () => {
        await withHttpServer(
            (_req, res) => {
                res.statusCode = 302;
                res.setHeader(
                    'location',
                    'http://169.254.169.254/latest/meta-data',
                );
                res.end();
            },
            async (port) => {
                const validated = makeValidatedUrl(
                    `http://example.test:${port}`,
                    '127.0.0.1',
                );

                const response = await fetchPinned(validated, {
                    retry: 0,
                    // @ts-expect-error redirect should be omitted from public options
                    redirect: 'follow',
                });
                await response.body?.cancel();

                expect(response.status).toBe(302);
            },
        );
    });
});

describe('Addon.fetchRetry SSRF protection', () => {
    test('validates URL before making the request', async () => {
        const addon = createAddon();

        const response = await addon.fetchRetry('file:///etc/passwd', {}, 0);

        expect(response.ok).toBe(false);
        expect(response.status).toBe(500);
    });

    test('rejects private resolved addresses by default', async () => {
        const addon = createAddon();

        const response = await addon.fetchRetry(
            'http://internal.example/hook',
            {
                validateUrlOptions: {
                    lookup: async () => [{ address: '10.0.0.10', family: 4 }],
                },
            },
            0,
        );

        expect(response.ok).toBe(false);
        expect(response.status).toBe(500);
    });

    test.each([
        ['64:ff9b::a9fe:a9fe', 'NAT64 well-known prefix'],
        ['64:ff9b:1::a9fe:a9fe', 'local-use NAT64 prefix'],
        ['2001:0:c0a8:1:0:0:80ff:fffe', 'Teredo tunneling prefix'],
    ])('rejects IPv6 transition address %s (%s)', async (address) => {
        const addon = createAddon();

        const response = await addon.fetchRetry(
            'http://evil.example/hook',
            {
                validateUrlOptions: {
                    lookup: async () => [{ address, family: 6 }],
                },
            },
            0,
        );

        expect(response.ok).toBe(false);
        expect(response.status).toBe(500);
    });

    test('allows private addresses with explicit SSRF override', async () => {
        const addon = createAddon();

        await withHttpServer(
            (_req, res) => {
                res.statusCode = 200;
                res.end('ok');
            },
            async (port) => {
                const response = await addon.fetchRetry(
                    `http://internal.example:${port}/hook`,
                    {
                        validateUrlOptions: {
                            allowPrivateNetworkUrls: true,
                            lookup: async () => [
                                { address: '127.0.0.1', family: 4 },
                            ],
                        },
                    },
                    0,
                );

                expect(response.status).toBe(200);
                expect(await response.text()).toBe('ok');
            },
        );
    });

    test('uses pinned IP from validation rather than resolving again at connect time', async () => {
        const addon = createAddon();

        await withHttpServer(
            (_req, res) => {
                res.statusCode = 200;
                res.end('ok');
            },
            async (port) => {
                const lookup = vi.fn(async () => [
                    { address: '127.0.0.1', family: 4 as const },
                ]);

                const response = await addon.fetchRetry(
                    `http://rebinding.example:${port}/hook`,
                    {
                        validateUrlOptions: {
                            allowPrivateNetworkUrls: true,
                            lookup,
                        },
                    },
                    0,
                );

                expect(response.status).toBe(200);
                expect(await response.text()).toBe('ok');
                expect(lookup).toHaveBeenCalledOnce();
                expect(lookup).toHaveBeenCalledWith('rebinding.example');
            },
        );
    });

    test('does not follow redirects', async () => {
        const addon = createAddon();

        await withHttpServer(
            (_req, res) => {
                res.statusCode = 302;
                res.setHeader(
                    'location',
                    'http://169.254.169.254/latest/meta-data',
                );
                res.end();
            },
            async (port) => {
                const response = await addon.fetchRetry(
                    `http://example.test:${port}/hook`,
                    {
                        validateUrlOptions: {
                            allowPrivateNetworkUrls: true,
                            lookup: async () => [
                                { address: '127.0.0.1', family: 4 },
                            ],
                        },
                    },
                    0,
                );

                expect(response.status).toBe(302);
                expect(response.headers.get('location')).toBe(
                    'http://169.254.169.254/latest/meta-data',
                );
            },
        );
    });

    test('preserves original Host header while connecting to pinned IP', async () => {
        const addon = createAddon();
        let expectedHost: string;
        await withHttpServer(
            (req, res) => {
                expect(req.headers.host).toBe(expectedHost);
                res.statusCode = 200;
                res.end('ok');
            },
            async (port) => {
                expectedHost = `example.test:${port}`;
                const response = await addon.fetchRetry(
                    `http://example.test:${port}/hook`,
                    {
                        throwHttpErrors: false,
                        validateUrlOptions: {
                            allowPrivateNetworkUrls: true,
                            lookup: async () => [
                                { address: '127.0.0.1', family: 4 },
                            ],
                        },
                    },
                    0,
                );

                expect(response.status).toBe(200);
            },
        );
    });
});

describe('validateUrl', () => {
    const lookupNeverCalled = async (): Promise<LookupAddress[]> => {
        throw new Error('IP literals must not be resolved through DNS');
    };

    test.each([
        'http://[::1]',
        'http://[fd00:ec2::254]',
        'https://[fe80::1]:9090',
        'http://[::ffff:169.254.169.254]',
    ])('rejects bracketed private IPv6 literal %s without a DNS lookup', async (rawUrl) => {
        await expect(
            validateUrl(rawUrl, { lookup: lookupNeverCalled }),
        ).rejects.toThrow(NonPublicAddressError);
    });

    test('pins the unbracketed address of an allowed IPv6 literal', async () => {
        const validated = await validateUrl('http://[fd00:ec2::254]:9090', {
            allowPrivateNetworkUrls: true,
            lookup: async () => [{ address: '93.184.216.34', family: 4 }],
        });

        expect(validated).toMatchObject({
            pinnedAddress: 'fd00:ec2::254',
            family: 6,
        });
    });
});

describe('urlWithPath', () => {
    const base = makeValidatedUrl('https://example.com/', '93.184.216.34');

    test('keeps the pinned address for a path on the same origin', () => {
        const derived = urlWithPath(base, '/api/things?limit=1');

        expect(derived.url.href).toBe('https://example.com/api/things?limit=1');
        expect(derived).toMatchObject({
            hostname: 'example.com',
            pinnedAddress: '93.184.216.34',
            family: 4,
        });
    });

    test.each([
        ['another host', '//other.example/api'],
        ['another scheme', 'http://example.com/api'],
        ['another port', 'https://example.com:8443/api'],
    ])('refuses a path that points at %s', (_, path) => {
        expect(() => urlWithPath(base, path)).toThrow(
            'Refusing to reuse pinned address',
        );
    });
});
