import { FC } from 'react';
import millify from 'millify';
import { Tooltip } from '@mui/material';
import { LARGE_NUMBER_PRETTIFIED } from 'utils/testIds';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';

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
}

export const PrettifyLargeNumber: FC<IPrettifyLargeNumberProps> = ({
    value,
    threshold = 1_000_000,
    precision = 2,
}) => {
    let prettyValue: string;
    let showTooltip = false;

    if (value < threshold) {
        prettyValue = value.toLocaleString();
    } else {
        prettyValue = millify(value, { precision });
        showTooltip = true;
    }

    const valueSpan = (
        <span data-testid={LARGE_NUMBER_PRETTIFIED}>{prettyValue}</span>
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
