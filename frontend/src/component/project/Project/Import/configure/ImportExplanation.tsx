import React, { FC } from 'react';
import { Box, styled, Typography } from '@mui/material';

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

export const ImportExplanation: FC = () => (
    <ImportExplanationContainer>
        <ImportExplanationHeader>
            What is being imported?
        </ImportExplanationHeader>
        <ImportExplanationDescription>
            Feature toggles will be imported with full configuration:
            <ul>
                <li>strategies</li>
                <li>context fields</li>
                <li>variants</li>
                <li>tags</li>
                <li>feature toggle status</li>
            </ul>
        </ImportExplanationDescription>
        <ImportExplanationHeader>Exceptions?</ImportExplanationHeader>
        <ImportExplanationDescription>
            If the feature toggle already exists in the new instance, it will be
            overwritten
        </ImportExplanationDescription>
        <ImportExplanationHeader>What is not imported?</ImportExplanationHeader>
        <ImportExplanationDescription sx={{ marginBottom: 0 }}>
            If we detect segments or custom strategies in your imported file, we
            will stop the import. You need to create them first in the new
            instance and run the import again
        </ImportExplanationDescription>
    </ImportExplanationContainer>
);
