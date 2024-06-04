import type React from 'react';
import type { FC } from 'react';
import { Box, styled, type SxProps, type Theme } from '@mui/material';

interface ITextCellProps {
    value?: string | null;
    lineClamp?: number;
    'data-testid'?: string;
    sx?: SxProps<Theme>;
    children?: React.ReactNode;
}

const StyledWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'lineClamp',
})<{ lineClamp?: number }>(({ theme, lineClamp }) => ({
    padding: theme.spacing(1, 2),
    display: '-webkit-box',
    overflow: lineClamp ? 'hidden' : 'auto',
    WebkitLineClamp: lineClamp ? lineClamp : 'none',
    WebkitBoxOrient: 'vertical',
    wordBreak: 'break-all',
    [theme.breakpoints.down('sm')]: {
        wordBreak: 'normal',
    },
}));

export const TextCell: FC<ITextCellProps> = ({
    value,
    children,
    lineClamp,
    sx,
    'data-testid': testid,
}) => (
    <StyledWrapper lineClamp={lineClamp} sx={sx}>
        <span data-loading='true' data-testid={testid}>
            {children ?? value}
        </span>
    </StyledWrapper>
);
