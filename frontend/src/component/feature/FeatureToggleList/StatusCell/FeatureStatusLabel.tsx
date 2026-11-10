import { type FC, useMemo } from 'react';
import type { FeatureSearchResponseSchema } from 'openapi';
import { styled } from '@mui/material';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { Truncator } from 'component/common/Truncator/Truncator';
import { getFeatureStatus } from './getFeatureStatus.ts';
import { getFeatureStatusText } from './getFeatureStatusText.ts';

const StyledTooltipLink = styled(TooltipLink)(() => ({
    whiteSpace: 'normal',
}));

export const FeatureStatusLabel: FC<
    Pick<FeatureSearchResponseSchema, 'lifecycle' | 'environments'>
> = ({ lifecycle, environments }) => {
    const { label, tooltip } = useMemo(
        () =>
            getFeatureStatusText(getFeatureStatus({ lifecycle, environments })),
        [lifecycle, environments],
    );

    if (!tooltip) {
        return <Truncator lines={2}>{label}</Truncator>;
    }

    return (
        <StyledTooltipLink tooltip={tooltip}>
            <Truncator lines={2}>{label}</Truncator>
        </StyledTooltipLink>
    );
};
