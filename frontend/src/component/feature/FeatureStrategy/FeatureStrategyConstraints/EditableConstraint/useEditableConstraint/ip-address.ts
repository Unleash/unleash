import { Address4, Address6 } from 'ip-address';

export const isIpOrCidr = (value: string): boolean =>
    Address4.isValid(value) || Address6.isValid(value);
