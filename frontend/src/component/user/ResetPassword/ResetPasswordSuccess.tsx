import { Button, styled, Typography } from '@mui/material';
import { Link, Navigate } from 'react-router-dom';
import { useFlag } from '@unleash/proxy-client-react';
import { AuthPageLayout } from '../common/AuthPageLayout';
import { AuthSuccessIcon } from '../common/AuthSuccessIcon';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(3),
    textAlign: 'center',
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: '28px',
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    lineHeight: '20px',
    marginTop: theme.spacing(0.5),
}));

const ResetPasswordSuccess = () => {
    const newLogin = useFlag('newLogin');

    if (!newLogin) {
        return <Navigate to='/login' replace />;
    }

    return (
        <AuthPageLayout>
            <StyledContainer>
                <div>
                    <AuthSuccessIcon />
                    <StyledTitle variant='h2'>
                        Your password has been reset
                    </StyledTitle>
                    <StyledSubtitle variant='body2'>
                        Try to sign in again.
                    </StyledSubtitle>
                </div>
                <Button
                    variant='contained'
                    color='primary'
                    component={Link}
                    to='/login'
                    fullWidth
                >
                    Sign in
                </Button>
            </StyledContainer>
        </AuthPageLayout>
    );
};

export default ResetPasswordSuccess;
