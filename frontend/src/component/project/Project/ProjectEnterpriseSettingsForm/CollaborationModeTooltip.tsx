import { Box, styled, Typography } from '@mui/material';
import type { FC } from 'react';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    display: 'inline',
}));
const StyledDescription = styled(Typography)(({ theme }) => ({
    display: 'inline',
    color: theme.palette.text.secondary,
}));

export const CollaborationModeTooltip: FC = () => {
    return (
        <HelpIcon
            htmlTooltip
            tooltip={
                <>
                    <Box>
                        <StyledTitle>open: </StyledTitle>
                        <StyledDescription>
                            Everyone can submit change requests
                        </StyledDescription>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <StyledTitle>protected: </StyledTitle>
                        <StyledDescription>
                            Only admins and project members can submit change
                            requests
                        </StyledDescription>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <StyledTitle>private: </StyledTitle>
                        <StyledDescription>
                            Only admins, editors and project members can see and
                            access the project and associated feature flags
                        </StyledDescription>
                    </Box>
                </>
            }
        />
    );
};
