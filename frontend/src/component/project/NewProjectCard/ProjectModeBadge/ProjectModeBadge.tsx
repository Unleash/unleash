import type { FC } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { Badge } from 'component/common/Badge/Badge';

interface IProjectModeBadgeProps {
    mode: 'private' | 'protected' | 'public' | string;
}

export const ProjectModeBadge: FC<IProjectModeBadgeProps> = ({ mode }) => {
    if (mode === 'private') {
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
