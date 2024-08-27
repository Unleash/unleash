import type { FC } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import ProtectedProjectIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PrivateProjectIcon from '@mui/icons-material/VisibilityOffOutlined';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { Badge } from 'component/common/Badge/Badge';
import { useUiFlag } from 'hooks/useUiFlag';
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
    const projectListImprovementsEnabled = useUiFlag('projectListImprovements');

    if (mode === 'private') {
        if (projectListImprovementsEnabled) {
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
        return (
            <HtmlTooltip
                title="This project's collaboration mode is set to private. The project and associated feature flags can only be seen by members of the project."
                arrow
            >
                <Badge color='warning' icon={<VisibilityOffIcon />} />
            </HtmlTooltip>
        );
    }

    if (mode === 'protected') {
        if (projectListImprovementsEnabled) {
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
        return (
            <HtmlTooltip
                title="This project's collaboration mode is set to protected. Only admins and project members can submit change requests."
                arrow
            >
                <Badge color='warning' icon={<LockIcon />} />
            </HtmlTooltip>
        );
    }

    return null;
};
