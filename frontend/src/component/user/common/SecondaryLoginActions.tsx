import { styled, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const StyledContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(2),
    width: '100%',
}));

const StyledLink = styled(Link)(({ theme }) => ({
    fontWeight: 'bold',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
}));

const StyledRef = styled('a')(({ theme }) => ({
    fontWeight: 'bold',
}));

const SecondaryLoginActions = () => {
    return (
        <StyledContainer>
            <StyledLink to='/forgotten-password'>
                <StyledTypography variant='body2'>
                    Forgot your password?
                </StyledTypography>
            </StyledLink>
            <Typography variant='body2'>
                Don't have an account?{' '}
                <StyledRef
                    href='https://www.getunleash.io/plans'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    Sign up
                </StyledRef>
            </Typography>
        </StyledContainer>
    );
};

export default SecondaryLoginActions;
