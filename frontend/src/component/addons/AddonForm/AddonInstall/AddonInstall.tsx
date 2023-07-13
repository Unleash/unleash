import React from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    StyledFormSection,
    StyledHelpText,
    StyledTitle,
} from '../AddonForm.styles';
import { Alert, Button } from '@mui/material';

export interface IAddonInstallProps {
    url: string;
    warning?: string;
    title?: string;
    text?: string;
}

export const AddonInstall = ({ url, warning, title, text }: IAddonInstallProps) => {
    return (
        <React.Fragment>
            <ConditionallyRender
                condition={Boolean(warning)}
                show={
                    <StyledFormSection>
                        <Alert severity="warning">
                            {warning}
                        </Alert>
                    </StyledFormSection>
                }
            />
            <StyledFormSection>
                <StyledTitle>
                    {title ?? 'Start addon installation'}
                </StyledTitle>
                <StyledHelpText>
                    {text ??
                        'Clicking this button will start the installation procedure for this bot.'}
                </StyledHelpText>
                <Button
                    type="button"
                    variant="outlined"
                    onClick={() => {
                        window.location.href = url;
                    }}
                >
                    Install
                </Button>
            </StyledFormSection>
        </React.Fragment>
    );
};
