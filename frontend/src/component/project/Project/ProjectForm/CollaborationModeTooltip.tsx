import { Box, styled, Typography } from '@mui/material';
import { FC } from 'react';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    display: ' inline',
}));
const StyledDescription = styled(Typography)(({ theme }) => ({
    display: ' inline',
    color: theme.palette.text.secondary,
}));

export const CollaborationModeTooltip: FC = () => (
    <HelpIcon
        htmlTooltip
        tooltip={
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
                        only admins and project members can submit change
                        requests
                    </StyledDescription>
                </Box>
            </>
        }
    />
);
