import type { VFC } from 'react';
import { Box, styled, type Theme, Typography } from '@mui/material';

interface IFeatureStaleCellProps {
    value?: boolean;
}

const staleStatus = (theme: Theme) => ({
    color: theme.palette.error.dark,
    fontSize: 'inherit',
});

const activeStatus = (theme: Theme) => ({
    color: theme.palette.success.dark,
    fontSize: 'inherit',
});

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
}));

export const FeatureStaleCell: VFC<IFeatureStaleCellProps> = ({ value }) => {
    return (
        <StyledBox>
            {value ? (
                <Typography component='span' sx={staleStatus} data-loading>
                    Stale
                </Typography>
            ) : (
                <Typography component='span' sx={activeStatus} data-loading>
                    Active
                </Typography>
            )}
        </StyledBox>
    );
};
