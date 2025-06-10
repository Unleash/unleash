import type { FC } from 'react';
import millify from 'millify';
import { Tooltip } from '@mui/material';
import { LARGE_NUMBER_PRETTIFIED } from 'utils/testIds';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender.tsx';

interface IPrettifyLargeNumberProps {
    /**
     * Value to prettify
     */
    value: number;
    /**
     * Threshold above which the number will be prettified. Values lower than this will just have comma separators added
     * @default 1_000_000
     */
    threshold?: number;
    /**
     * The number of significant figures
     * @default 2
     */
    precision?: number;
    /**
     * Data attribute for loading state
     */
    'data-loading'?: string;
}

export const prettifyLargeNumber =
    (threshold: number = 1_000_000, precision: number = 2) =>
    (value: number) => {
        if (value < threshold) {
            return value.toLocaleString();
        }
        return millify(value, { precision });
    };

export const PrettifyLargeNumber: FC<IPrettifyLargeNumberProps> = ({
    value,
    threshold = 1_000_000,
    precision = 2,
    'data-loading': dataLoading,
}) => {
    const prettyValue = prettifyLargeNumber(threshold, precision)(value);
    const showTooltip = value > threshold;

    const valueSpan = (
        <span data-loading={dataLoading} data-testid={LARGE_NUMBER_PRETTIFIED}>
            {prettyValue}
        </span>
    );

    return (
        <ConditionallyRender
            condition={showTooltip}
            show={
                <Tooltip title={value.toLocaleString()} arrow>
                    {valueSpan}
                </Tooltip>
            }
            elseShow={valueSpan}
        />
    );
};
