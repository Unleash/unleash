import { VFC } from 'react';
import { Box, styled, Theme, Typography } from '@mui/material';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';

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
            <ConditionallyRender
                condition={Boolean(value)}
                show={
                    <Typography component="span" sx={staleStatus} data-loading>
                        Stale
                    </Typography>
                }
                elseShow={
                    <Typography component="span" sx={activeStatus} data-loading>
                        Active
                    </Typography>
                }
            />
        </StyledBox>
    );
};
