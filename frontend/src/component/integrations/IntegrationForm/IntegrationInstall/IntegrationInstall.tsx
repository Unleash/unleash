import React from 'react';
import {
    StyledHelpText,
    StyledTitle,
} from '../IntegrationForm.styles';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

export interface IAddonInstallProps {
    url: string;
    title?: string;
    helpText?: string;
}

export const IntegrationInstall = ({
    url,
    title = 'Install addon',
    helpText = 'Click this button to install this addon.',
}: IAddonInstallProps) => {
    return (
        <React.Fragment>
            <StyledTitle>{title}</StyledTitle>
            <StyledHelpText>{helpText}</StyledHelpText>
            <Button
                type="button"
                variant="outlined"
                component={Link}
                target="_blank"
                rel="noopener noreferrer"
                to={url}
            >
                Install
            </Button>
        </React.Fragment>
    );
};
