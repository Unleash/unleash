import React from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    StyledFormSection,
    StyledHelpText,
    StyledTitle,
} from '../AddonForm.styles';
import { Alert, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export interface IAddonInstallProps {
    url: string;
    warning?: string;
    title?: string;
    helpText?: string;
}

export const AddonInstall = ({
    url,
    warning,
    title = 'Install addon',
    helpText = 'Click this button to install this addon.',
}: IAddonInstallProps) => {
    return (
        <React.Fragment>
            <ConditionallyRender
                condition={Boolean(warning)}
                show={
                    <StyledFormSection>
                        <Alert severity="warning">{warning}</Alert>
                    </StyledFormSection>
                }
            />
            <StyledFormSection>
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
            </StyledFormSection>
        </React.Fragment>
    );
};
