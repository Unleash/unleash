import { Box, styled, Typography } from '@mui/material';
import { FC } from 'react';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { useUiFlag } from 'hooks/useUiFlag';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    display: ' inline',
}));
const StyledDescription = styled(Typography)(({ theme }) => ({
    display: ' inline',
    color: theme.palette.text.secondary,
}));

export const CollaborationModeTooltip: FC = () => {
    const privateProjects = useUiFlag('privateProjects');
    return (
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
                    <ConditionallyRender
                        condition={Boolean(privateProjects)}
                        show={
                            <Box sx={{ mt: 2 }}>
                                <StyledTitle>private: </StyledTitle>
                                <StyledDescription>
                                    only projects members can and access see the
                                    project
                                </StyledDescription>
                            </Box>
                        }
                    />
                </>
            }
        />
    );
};
