import { Box, Link, styled, Typography } from '@mui/material';
import { FC, ReactNode } from 'react';

export const ChangeItemWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
}));

const ChangeItemInfo: FC = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
}));

export const StrategyAddedChange: FC<{ discard?: ReactNode }> = ({
    children,
    discard,
}) => {
    return (
        <ChangeItemWrapper>
            <ChangeItemInfo>
                <Typography
                    sx={theme => ({ color: theme.palette.success.dark })}
                >
                    + Adding strategy:
                </Typography>
                {children}
            </ChangeItemInfo>
            {discard}
        </ChangeItemWrapper>
    );
};

export const StrategyEditedChange: FC<{ discard?: ReactNode }> = ({
    children,
    discard,
}) => {
    return (
        <ChangeItemWrapper>
            <ChangeItemInfo>
                <Typography>Editing strategy:</Typography>
                {children}
            </ChangeItemInfo>
            {discard}
        </ChangeItemWrapper>
    );
};

export const StrategyDeletedChange: FC<{ discard?: ReactNode }> = ({
    discard,
    children,
}) => {
    return (
        <ChangeItemWrapper>
            <ChangeItemInfo>
                <Typography sx={theme => ({ color: theme.palette.error.main })}>
                    - Deleting strategy
                </Typography>
                {children}
            </ChangeItemInfo>
            {discard}
        </ChangeItemWrapper>
    );
};
