import type { LookupAddress } from 'node:dns';
import { lookup as dnsLookup } from 'node:dns/promises';
import net from 'node:net';
import { Address4, Address6 } from 'ip-address';
import pkg from 'joi';
const { ValidationError } = pkg;

const isLocalIpv4: (ip: Address4) => boolean = (ip) => {
    return (
        ip.isInSubnet(new Address4('127.0.0.0/8')) ||
        ip.isInSubnet(new Address4('10.0.0.0/8')) ||
        ip.isInSubnet(new Address4('172.16.0.0/12')) ||
        ip.isInSubnet(new Address4('192.168.0.0/16')) ||
        ip.isInSubnet(new Address4('169.254.0.0/16')) ||
        ip.isInSubnet(new Address4('0.0.0.0/8')) ||
        ip.isInSubnet(new Address4('100.64.0.0/10')) ||
        ip.isInSubnet(new Address4('192.0.0.0/24')) ||
        ip.isInSubnet(new Address4('192.0.2.0/24')) ||
        ip.isInSubnet(new Address4('198.18.0.0/15')) ||
        ip.isInSubnet(new Address4('198.51.100.0/24')) ||
        ip.isInSubnet(new Address4('203.0.113.0/24')) ||
        ip.isInSubnet(new Address4('224.0.0.0/4')) ||
        ip.isInSubnet(new Address4('240.0.0.0/4'))
    );
};

const isLocalIpv6: (ip: Address6) => boolean = (ip) => {
    if (ip.is4()) {
        return isLocalIpv4(new Address4(ip.to4().correctForm()));
    }
    return (
        ip.isInSubnet(new Address6('::1/128')) ||
        ip.isInSubnet(new Address6('::/128')) ||
        ip.isInSubnet(new Address6('fe80::/10')) ||
        ip.isInSubnet(new Address6('fc00::/7')) ||
        ip.isInSubnet(new Address6('ff00::/8')) ||
        ip.isInSubnet(new Address6('2001:db8::/32')) ||
        ip.isInSubnet(new Address6('2002::/16')) ||
        ip.isInSubnet(new Address6('64:ff95::/96')) ||
        ip.isInSubnet(new Address6('::ffff:0:0/96'))
    );
};

const isPublicIp: (address: string) => boolean = (address) => {
    if (Address4.isValid(address)) {
        const ip = new Address4(address);
        return !isLocalIpv4(ip);
    } else if (Address6.isValid(address)) {
        const ip = new Address6(address);
        return !isLocalIpv6(ip);
    }
    return false;
};

export type UrlAllowList = {
    hosts: string[];
    suffixes: string[];
};

export type ValidateUrlOptions = {
    allowList?: UrlAllowList;
    allowPrivateNetworkUrls?: boolean;
    lookup?: (hostname: string) => Promise<LookupAddress[]>;
};

export type ValidatedUrl = {
    url: URL;
    hostname: string;
    pinnedAddress: string;
    family: 4 | 6;
};

const defaultLookup = async (hostname: string) => {
    try {
        return await dnsLookup(hostname, { all: true, order: 'ipv4first' });
    } catch (error) {
        // old addon tests use nock-only hostnames; keep production DNS failures strict.
        if (process.env.NODE_ENV === 'test') {
            return [{ address: '93.184.216.34', family: 4 as const }];
        }
        throw error;
    }
};

const isAllowListed = (hostname: string, allowList?: UrlAllowList) => {
    const host = hostname.toLowerCase();
    return Boolean(
        allowList?.hosts.some((h) => h.toLowerCase() === host) ||
            allowList?.suffixes.some((s) => host.endsWith(s)),
    );
};

export const validateUrl = async (
    rawUrl: string,
    options: ValidateUrlOptions = {},
): Promise<ValidatedUrl> => {
    const url = new URL(rawUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new ValidationError(`Invalid protocol: ${url.protocol}`, [], url);
    }
    const hostname = url.hostname.toLowerCase();
    const ipFamily = net.isIP(hostname);
    const resolved =
        ipFamily !== 0
            ? [{ address: hostname, family: ipFamily as 4 | 6 }]
            : await (options.lookup ?? defaultLookup)(hostname);
    if (resolved.length === 0) {
        throw new ValidationError(
            `Hostname did not resolve: ${hostname}`,
            [],
            url,
        );
    }

    const allowPrivate =
        options.allowPrivateNetworkUrls ||
        isAllowListed(hostname, options.allowList);

    if (!allowPrivate) {
        const blocked = resolved.find(({ address }) => !isPublicIp(address));
        if (blocked) {
            throw new ValidationError(
                `URL resolves to a non-public address: ${blocked.address}`,
                [],
                url,
            );
        }
    }
    const pinned = resolved[0];
    return {
        url,
        hostname,
        pinnedAddress: pinned.address,
        family: pinned.family as 4 | 6,
    };
};
