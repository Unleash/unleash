import { FC } from 'react';
import millify from 'millify';

interface IPrettifyLargeNumberProps {
    /**
     * Value to prettify
     */
    value: number;
    /**
     * Threshold above which the number will be prettified. Values lower than this will just have comma separators added
     */
    threshold?: number;
}

export const PrettifyLargeNumber: FC<IPrettifyLargeNumberProps> = ({
    value,
    threshold = 1_000_000,
}) => {
    if (value < threshold) {
        return <>{value.toLocaleString()}</>;
    }

    return <>{millify(value)}</>;
};
