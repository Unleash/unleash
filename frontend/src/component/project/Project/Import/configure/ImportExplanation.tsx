import type { FC } from 'react';
import { Box, styled, Typography } from '@mui/material';
import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates';

const ImportExplanationContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(3),
}));

const ImportExplanationHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(0.5),
}));

const ImportExplanationDescription = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

export const ImportExplanation: FC = () => {
    const { templates } = useReleasePlanTemplates();
    const hasReleaseTemplates = Boolean(templates.length);
    return (
        <ImportExplanationContainer>
            <ImportExplanationHeader>
                What is being imported?
            </ImportExplanationHeader>
            <ImportExplanationDescription>
                Feature flags will be imported with full configuration:
                <ul>
                    <li>strategies</li>
                    <li>context fields</li>
                    <li>variants</li>
                    <li>tags</li>
                    <li>feature flag status</li>
                    <li>feature dependencies</li>
                    <li>feature links</li>
                </ul>
            </ImportExplanationDescription>
            <ImportExplanationHeader>Exceptions?</ImportExplanationHeader>
            <ImportExplanationDescription>
                If the feature flag already exists in the new instance, it will
                be overwritten
            </ImportExplanationDescription>
            <ImportExplanationHeader>
                What is not imported?
            </ImportExplanationHeader>
            <ImportExplanationDescription sx={{ marginBottom: 0 }}>
                If we detect segments or custom strategies in your imported
                file, we will stop the import. You need to create them first in
                the new instance and run the import again
            </ImportExplanationDescription>
            {hasReleaseTemplates && (
                <ImportExplanationDescription sx={{ marginTop: 2 }}>
                    Release plans are not included in the import. You may need
                    to set up new release plans for the imported feature flags
                </ImportExplanationDescription>
            )}
        </ImportExplanationContainer>
    );
};
