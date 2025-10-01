import millify from 'millify';

export const prettifyLargeNumber =
    (threshold: number = 1_000_000, precision: number = 2) =>
    (value: number) => {
        if (value < threshold) {
            return value.toLocaleString();
        }
        return millify(value, { precision });
    };
