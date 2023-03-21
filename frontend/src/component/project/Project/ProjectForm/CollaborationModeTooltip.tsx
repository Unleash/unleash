import { Box, styled, Typography } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import { HtmlTooltip } from '../../../common/HtmlTooltip/HtmlTooltip';
import React, { FC } from 'react';

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    display: ' inline',
}));
const StyledDescription = styled(Typography)(({ theme }) => ({
    display: ' inline',
    color: theme.palette.text.secondary,
}));

export const CollaborationModeTooltip: FC = () => (
    <HtmlTooltip
        title={
            <>
                <Box>
                    <StyledTitle>open: </StyledTitle>
                    <StyledDescription>
                        everyone can submit change requests
                    </StyledDescription>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <StyledTitle>protected: </StyledTitle>
                    <StyledDescription>
                        viewers who are not project members cannot submit change
                        requests
                    </StyledDescription>
                </Box>
            </>
        }
        arrow
        describeChild
    >
        <HelpOutline />
    </HtmlTooltip>
);
