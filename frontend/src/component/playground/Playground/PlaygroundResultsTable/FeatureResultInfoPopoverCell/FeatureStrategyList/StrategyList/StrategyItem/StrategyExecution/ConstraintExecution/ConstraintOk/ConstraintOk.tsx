import { CheckCircleOutline } from '@mui/icons-material';
import { styled, Typography } from '@mui/material';

const StyledCheckOutline = styled(CheckCircleOutline)(({ theme }) => ({
    color: theme.palette.success.main,
}));

const StyledConstraintOKDiv = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    color: theme.palette.success.main,
}));

export const ConstraintOk = () => {
    return (
        <StyledConstraintOKDiv>
            <StyledCheckOutline style={{ marginRight: '0.25rem' }} />
            <Typography variant="body2">
                Constraint met by value in context
            </Typography>
        </StyledConstraintOKDiv>
    );
};
