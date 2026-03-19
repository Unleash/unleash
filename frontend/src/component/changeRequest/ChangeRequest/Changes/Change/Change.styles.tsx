import {
    styled,
    type Theme,
    Typography,
    type TypographyProps,
} from '@mui/material';
import type { FC } from 'react';

export const colors = (theme: Theme) => ({
    added: theme.palette.success.dark,
    deleted: theme.palette.error.main,
});

export const Action: FC<TypographyProps> = ({ children, ...props }) => (
    <Typography component='span' {...props}>
        {children}
    </Typography>
);

export const Deleted = styled(Action)(({ theme }) => ({
    color: colors(theme).deleted,
    '::before': { content: '"- "' },
}));

export const Added = styled(Action)(({ theme }) => ({
    '::before': { content: '"+ "' },
    color: colors(theme).added,
}));

export const AddedStrategy = styled(Added, {
    shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled?: boolean }>(({ theme, disabled }) => ({
    color: disabled ? theme.palette.text.secondary : undefined,
}));

const Change = styled('span')({
    fontWeight: 'bold',
});

export const ChangeItemInfo = styled(
    ({ children, ...props }: TypographyProps) => (
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
    rowGap: theme.spacing(0.5),
}));

export const ChangeItemWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
}));
