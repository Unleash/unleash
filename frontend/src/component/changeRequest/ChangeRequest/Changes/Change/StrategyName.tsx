import type { FC } from 'react';
import { formatStrategyName } from 'utils/strategyNames';
import { Typography, styled } from '@mui/material';
import { textTruncated } from 'themes/themeStyles';
import { NameWithChangeInfo } from './NameWithChangeInfo/NameWithChangeInfo.tsx';

interface IStrategyTooltipLinkProps {
    name: string;
    title?: string;
    previousTitle?: string;
}

const Truncated = styled('div')(() => ({
    ...textTruncated,
    maxWidth: 500,
}));

export const StrategyTooltipLink: FC<IStrategyTooltipLinkProps> = ({
    name,
    title,
    previousTitle,
}) => {
    return (
        <Truncated>
            <Typography component='span'>{formatStrategyName(name)}</Typography>
            <NameWithChangeInfo newName={title} previousName={previousTitle} />
        </Truncated>
    );
};
