export enum PayloadType {
    STRING = 'string',
    JSON = 'json',
    CSV = 'csv',
}

export interface Payload {
    type: PayloadType;
    value: string;
}

export interface Variant {
    name: string;
    enabled: boolean;
    payload?: Payload;
}

export const getVariantValue = <T = string>(
    variant: Variant | undefined
): T | undefined => {
    if (variant?.payload !== undefined) {
        if (variant.payload.type === PayloadType.JSON) {
            return JSON.parse(variant.payload.value) as T;
        }

        return variant.payload.value as T;
    }
};
