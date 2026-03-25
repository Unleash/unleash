import { useState } from 'react';
import { Button, Divider, styled, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { AuthPageLayout } from '../common/AuthPageLayout';
import { AuthSuccessIcon } from '../common/AuthSuccessIcon';
import { SnakeGame } from './SnakeGame';

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

const SignedOut = () => {
    const [showSnake, setShowSnake] = useState(false);

    return (
        <AuthPageLayout>
            <StyledContainer>
                <div>
                    <AuthSuccessIcon />
                    <StyledTitle variant='h2'>
                        You are signed out of Unleash
                    </StyledTitle>
                    <StyledSubtitle variant='body2'>
                        Bye bye, hope to see you soon!
                    </StyledSubtitle>
                </div>
                <Button
                    variant='contained'
                    color='primary'
                    component={Link}
                    to='/login'
                    fullWidth
                >
                    Sign back into your instance
                </Button>
                {showSnake ? (
                    <SnakeGame />
                ) : (
                    <>
                        <Divider sx={{ width: '100%' }}>OR</Divider>
                        <Button
                            variant='outlined'
                            fullWidth
                            onClick={() => setShowSnake(true)}
                        >
                            Play snake!
                        </Button>
                    </>
                )}
            </StyledContainer>
        </AuthPageLayout>
    );
};

export default SignedOut;
