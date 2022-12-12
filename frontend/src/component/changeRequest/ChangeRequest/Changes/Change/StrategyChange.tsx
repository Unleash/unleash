import { Box, styled, Typography } from '@mui/material';
import { FC, ReactNode } from 'react';

export const ChangeItemWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

export const ChangeItemCreateEditWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const ChangeItemInfo: FC = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
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
                <Typography>Editing strategy:</Typography>
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
