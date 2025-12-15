import type { FC } from 'react';
import { Box, Typography, Link, styled } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon.tsx';

const StyledTooltipContent = styled(Box)(({ theme }) => ({
    margin: theme.spacing(1),
}));

const StyledSafeguardLink = styled(Link)<{ component?: any; to?: string }>(
    ({ theme }) => ({
        display: 'block',
        marginTop: theme.spacing(1),
        color: 'inherit',
        textDecoration: 'underline',
    }),
);

interface SafeguardHelpIconProps {
    projectId: string;
    featureName: string;
}

export const SafeguardHelpIcon: FC<SafeguardHelpIconProps> = ({
    projectId,
    featureName,
}) => (
    <HelpIcon
        tooltip={
            <StyledTooltipContent>
                <Typography variant='inherit'>
                    This graph helps you monitor the safeguard you put on the
                    release plan.
                </Typography>
                <StyledSafeguardLink
                    component={RouterLink}
                    to={`/projects/${projectId}/features/${featureName}`}
                >
                    View safeguard
                </StyledSafeguardLink>
            </StyledTooltipContent>
        }
        size='1.5rem'
    />
);
