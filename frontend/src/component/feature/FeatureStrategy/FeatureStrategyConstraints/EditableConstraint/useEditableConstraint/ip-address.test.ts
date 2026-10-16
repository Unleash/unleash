import { describe, expect, test } from 'vitest';
import { getTargetRange } from './ip-address.js';

describe('getTargetRange', () => {
    test('spans the first and last address of an IPv4 CIDR range', () => {
        expect(getTargetRange('10.0.0.0/8')).toEqual([
            '10.0.0.0',
            '10.255.255.255',
        ]);
    });

    test('spans the first and last address of an IPv6 CIDR range', () => {
        expect(getTargetRange('2001:db8::/32')).toEqual([
            '2001:db8::',
            '2001:db8:ffff:ffff:ffff:ffff:ffff:ffff',
        ]);
    });

    test('has no range for a single IPv4 address', () => {
        expect(getTargetRange('192.168.1.1')).toBeUndefined();
    });

    test('has no range for a single IPv6 address', () => {
        expect(getTargetRange('::1')).toBeUndefined();
    });

    test('has no range for a value that is not an IP or CIDR range', () => {
        expect(getTargetRange('not an ip')).toBeUndefined();
    });
});
