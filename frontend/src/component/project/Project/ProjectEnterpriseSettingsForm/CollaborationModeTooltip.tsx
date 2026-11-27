import { Box, styled, Typography } from '@mui/material';
import type { FC } from 'react';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { collaborationModeDescriptions } from './collaborationModeDescriptions.ts';

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
                            {collaborationModeDescriptions.open}
                        </StyledDescription>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <StyledTitle>protected: </StyledTitle>
                        <StyledDescription>
                            {collaborationModeDescriptions.protected}
                        </StyledDescription>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <StyledTitle>private: </StyledTitle>
                        <StyledDescription>
                            {collaborationModeDescriptions.private}
                        </StyledDescription>
                    </Box>
                </>
            }
        />
    );
};
