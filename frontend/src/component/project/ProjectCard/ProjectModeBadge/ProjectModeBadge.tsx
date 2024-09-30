import type { FC } from 'react';
import ProtectedProjectIcon from '@mui/icons-material/LockOutlined';
import PrivateProjectIcon from '@mui/icons-material/VisibilityOffOutlined';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { styled } from '@mui/material';

interface IProjectModeBadgeProps {
    mode?: 'private' | 'protected' | 'public' | string;
}

const StyledIcon = styled('div')(({ theme }) => ({
    color: theme.palette.primary.main,
    fontSize: theme.spacing(2.25),
    paddingTop: theme.spacing(0.75),
}));

export const ProjectModeBadge: FC<IProjectModeBadgeProps> = ({ mode }) => {
    if (mode === 'private') {
        return (
            <HtmlTooltip
                title="This project's collaboration mode is set to private. The project and associated feature flags can only be seen by members of the project."
                arrow
            >
                <StyledIcon>
                    <PrivateProjectIcon fontSize='inherit' />
                </StyledIcon>
            </HtmlTooltip>
        );
    }

    if (mode === 'protected') {
        return (
            <HtmlTooltip
                title="This project's collaboration mode is set to protected. Only admins and project members can submit change requests."
                arrow
            >
                <StyledIcon>
                    <ProtectedProjectIcon fontSize='inherit' />
                </StyledIcon>
            </HtmlTooltip>
        );
    }

    return null;
};
