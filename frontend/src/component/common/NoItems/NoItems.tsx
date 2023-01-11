import { ReactComponent as NoItemsIcon } from 'assets/icons/addfiles.svg';
import React from 'react';
import { styled } from '@mui/material';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    width: '80%',
    margin: '0 auto',
    [theme.breakpoints.down(700)]: {
        flexDirection: 'column',
        alignItems: 'center',
    },
}));

const StyledTextContainer = styled('div')(({ theme }) => ({
    width: '50%',
    [theme.breakpoints.down(700)]: {
        width: '100%',
    },
}));

const StyledIconContainer = styled('div')(({ theme }) => ({
    width: '50%',
    [theme.breakpoints.down(700)]: {
        width: '100%',
    },
}));

const StyledIcon = styled(NoItemsIcon)(({ theme }) => ({
    width: '300px',
    height: '200px',
    [theme.breakpoints.down(700)]: {
        marginTop: theme.spacing(4),
    },
    [theme.breakpoints.down(500)]: {
        display: 'none',
    },
}));

const NoItems: React.FC = ({ children }) => {
    return (
        <StyledContainer>
            <StyledTextContainer>{children}</StyledTextContainer>
            <StyledIconContainer>
                <StyledIcon />
            </StyledIconContainer>
        </StyledContainer>
    );
};

export default NoItems;
