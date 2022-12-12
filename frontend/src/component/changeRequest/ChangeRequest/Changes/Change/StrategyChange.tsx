import { Box, styled, Typography } from '@mui/material';
import { FC, ReactNode } from 'react';

export const ChangeItemWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
});

export const ChangeItemCreateEditWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
});

const ChangeItemInfo: FC = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
}));

export const StrategyAddedChange: FC<{ discard?: ReactNode }> = ({
    children,
    discard,
}) => {
    return (
        <ChangeItemCreateEditWrapper>
            <ChangeItemInfo>
                <Typography
                    sx={theme => ({
                        color: theme.palette.success.dark,
                        marginBottom: theme.spacing(2),
                    })}
                >
                    + Adding strategy:
                </Typography>
                {children}
            </ChangeItemInfo>
            {discard}
        </ChangeItemCreateEditWrapper>
    );
};

export const StrategyEditedChange: FC<{ discard?: ReactNode }> = ({
    children,
    discard,
}) => {
    return (
        <ChangeItemCreateEditWrapper>
            <ChangeItemInfo>
                <Typography
                    sx={theme => ({
                        marginBottom: theme.spacing(2),
                    })}
                >
                    Editing strategy:
                </Typography>
                {children}
            </ChangeItemInfo>
            {discard}
        </ChangeItemCreateEditWrapper>
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
