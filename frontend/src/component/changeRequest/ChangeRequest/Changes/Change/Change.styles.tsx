import { styled, Typography } from '@mui/material';
import type { PropsWithChildren } from 'react';

export const Deleted = styled(Typography)(({ theme }) => ({
    color: theme.palette.error.main,
    '::before': { content: '"- "' },
}));

export const Added = styled(Typography)(({ theme }) => ({
    '::before': { content: '"+ "' },
    color: theme.palette.success.dark,
}));

export const AddedStrategy = styled(Added, {
    shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled?: boolean }>(({ theme, disabled }) => ({
    color: disabled ? theme.palette.text.disabled : undefined,
}));

const Change = styled('span')({
    fontWeight: 'bold',
});

export const ChangeItemInfo = styled(
    ({ children, ...props }: PropsWithChildren) => (
        <Typography {...props}>
            <Change>Change:</Change>
            {children}
        </Typography>
    ),
)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row',
    alignItems: 'center',
    flex: 'auto',
    gap: `1ch`,
}));
