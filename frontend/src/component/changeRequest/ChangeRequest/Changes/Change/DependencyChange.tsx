import { ReactNode, VFC } from 'react';
import { Box, styled, Typography } from '@mui/material';
import {
    IChangeRequestAddDependency,
    IChangeRequestDeleteDependency,
} from 'component/changeRequest/changeRequest.types';
import { Link } from 'react-router-dom';
import { ChangeItemWrapper } from './StrategyChange';


const StyledLink = styled(Link)(({ theme }) => ({
    maxWidth: '100%',
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

export const DependencyChange: VFC<{
    actions?: ReactNode;
    change:
        | IChangeRequestAddDependency
        | IChangeRequestDeleteDependency
    projectId: string;
    onNavigate?: () => void;
}> = ({ actions, change, projectId, onNavigate }) => {
    return (
        <>
            {change.action === 'addDependency' && (
                <>
                    <ChangeItemWrapper>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Typography
                                color={
                                    'success.dark'                                }
                            >
                                + Adding dependency:
                            </Typography>
                            <StyledLink
                                to={`/projects/${projectId}/features/${change.payload.feature}`}
                                onClick={onNavigate}
                            >
                                {change.payload.feature}
                            </StyledLink>
                        </Box>
                        {actions}
                    </ChangeItemWrapper>
                </>
            )}
            {change.action === 'deleteDependency' && (
                <ChangeItemWrapper>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Typography
                            sx={(theme) => ({
                                color: theme.palette.error.main,
                            })}
                        >
                            - Deleting dependencies
                        </Typography>
                    </Box>
                    {actions}
                </ChangeItemWrapper>
            )}
        </>
    );
};
