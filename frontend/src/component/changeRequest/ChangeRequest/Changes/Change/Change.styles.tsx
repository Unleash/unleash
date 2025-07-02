import { styled, Typography } from '@mui/material';
import type { PropsWithChildren } from 'react';

const Action = styled(Typography)(({ theme }) => ({
    whiteSpace: 'nowrap',
}));

export const Deleted = styled(Action)(({ theme }) => ({
    color: theme.palette.error.main,
    '::before': { content: '"- "' },
}));

export const Added = styled(Action)(({ theme }) => ({
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
            <Change>Change: </Change>
            {children}
        </Typography>
    ),
)(({ theme }) => ({
    display: 'flex',
    justifyItems: 'flex-start',
    flexFlow: 'row wrap',
    alignItems: 'center',
    flex: 'auto',
    columnGap: `1ch`,
    rowGap: theme.spacing(1),
}));

export const ChangeItemWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
}));
