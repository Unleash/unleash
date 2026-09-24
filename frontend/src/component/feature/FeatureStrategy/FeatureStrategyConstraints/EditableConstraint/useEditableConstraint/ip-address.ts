import { Address4, Address6 } from 'ip-address';

const parseIpOrCidr = (value: string): Address4 | Address6 | undefined => {
    if (Address4.isValid(value)) {
        return new Address4(value);
    }
    if (Address6.isValid(value)) {
        return new Address6(value);
    }
    return undefined;
};

export const isIpOrCidr = (value: string): boolean =>
    parseIpOrCidr(value) !== undefined;

export const getTargetRange = (
    value: string,
): [start: string, end: string] | undefined => {
    const address = parseIpOrCidr(value);
    if (!address) {
        return undefined;
    }

    const start = address.startAddress().correctForm();
    const end = address.endAddress().correctForm();

    return start === end ? undefined : [start, end];
};
