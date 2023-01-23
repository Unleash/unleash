import { ImportLayoutContainer } from './ImportLayoutContainer';
import { Box, styled, Typography } from '@mui/material';
import { FC } from 'react';

const ImportInfoContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.secondaryContainer,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(3),
}));

const Label = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));
const Value = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.primary,
    fontWeight: theme.fontWeight.bold,
}));

export const ValidationStage: FC<{ environment: string; project: string }> = ({
    environment,
    project,
}) => {
    return (
        <ImportLayoutContainer>
            <ImportInfoContainer>
                <Typography sx={{ mb: 1.5 }}>
                    You are importing this configuration in:
                </Typography>
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <span>
                        <Label>Environment: </Label>
                        <Value>{environment}</Value>
                    </span>
                    <span>
                        <Label>Project: </Label>
                        <Value>{project}</Value>
                    </span>
                </Box>
            </ImportInfoContainer>
        </ImportLayoutContainer>
    );
};
