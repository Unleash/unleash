import type { ValidatedUrl } from './validate-url.js';
import ky, { type Options } from 'ky';
import https from 'node:https';
import http from 'node:http';

export const fetchPinned = async (
    validated: ValidatedUrl,
    options: Omit<Options, 'fetch' | 'redirect' | 'throwHttpErrors'>,
): Promise<Response> => {
    return ky(validated.url.href, {
        ...options,
        // Do not let 30x redirect to metadata/internal hosts.
        redirect: 'manual',
        // Important: return 30x responses instead of throwing.
        throwHttpErrors: false,
        fetch: (input, init) => fetchWithPinnedLookup(input, init, validated),
    });
};

const fetchWithPinnedLookup = async (
    input: Parameters<typeof fetch>[0],
    init: Parameters<typeof fetch>[1],
    validated: ValidatedUrl,
): Promise<Response> => {
    const request = new Request(input, init);
    const body = request.body
        ? Buffer.from(await request.arrayBuffer())
        : undefined;
    const requestUrl = new URL(request.url);
    const client = requestUrl.protocol === 'https:' ? https : http;

    return new Promise<Response>((resolve, reject) => {
        const req = client.request(
            requestUrl,
            {
                method: request.method,
                headers: Object.fromEntries(request.headers),
                signal: request.signal,
                lookup: (_hostname, options, callback) => {
                    const cb =
                        typeof options === 'function' ? options : callback;
                    if (typeof cb !== 'function') {
                        return;
                    }
                    if (typeof options !== 'function' && options?.all) {
                        cb(null, [
                            {
                                address: validated.pinnedAddress,
                                family: validated.family,
                            },
                        ]);
                        return;
                    }
                    cb(null, validated.pinnedAddress, validated.family);
                },
            },
            (res) => {
                const chunks: Buffer[] = [];
                res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
                res.on('end', () => {
                    const status = res.statusCode ?? 200;
                    const headers = new Headers();
                    for (const [key, value] of Object.entries(res.headers)) {
                        if (Array.isArray(value)) {
                            for (const item of value) {
                                headers.append(key, item);
                            }
                        } else if (value) {
                            headers.set(key, value);
                        }
                    }
                    resolve(
                        new Response(
                            status === 204 || status === 304
                                ? null
                                : Buffer.concat(chunks),
                            {
                                status,
                                statusText: res.statusMessage,
                                headers,
                            },
                        ),
                    );
                });
            },
        );

        req.on('error', reject);
        req.end(body);
    });
};
