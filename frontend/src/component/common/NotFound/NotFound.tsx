import { Button, styled, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

import { ReactComponent as LogoIcon } from 'assets/icons/logoBg.svg';
import { GO_BACK } from 'constants/navigate';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: theme.spacing(4),
    position: 'fixed',
    inset: 0,
    backgroundColor: theme.palette.primary.contrastText,
    width: '100%',
}));

const StyledLogo = styled(LogoIcon)(({ theme }) => ({
    height: '80px',
}));

const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    position: 'relative',
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(4),
}));

const StyledHomeButton = styled(Button)(({ theme }) => ({
    height: '150px',
    width: '150px',
    position: 'absolute',
    right: 100,
    top: 45,
}));

const NotFound = () => {
    const navigate = useNavigate();

    const onClickHome = () => {
        navigate('/');
    };

    const onClickBack = () => {
        navigate(GO_BACK);
    };

    return (
        <StyledContainer>
            <div>
                <StyledLogo />
                <StyledContent>
                    <Typography variant="h1" style={{ fontSize: '2rem' }}>
                        Ooops. That's a page we haven't toggled on yet.
                    </Typography>
                </StyledContent>
                <StyledButtonContainer>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onClickBack}
                    >
                        Go back
                    </Button>
                    <StyledHomeButton onClick={onClickHome}>
                        Go home
                    </StyledHomeButton>
                </StyledButtonContainer>
            </div>
        </StyledContainer>
    );
};

export default NotFound;
