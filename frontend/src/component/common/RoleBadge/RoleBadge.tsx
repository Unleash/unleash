import { Badge } from 'component/common/Badge/Badge';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { useRole } from 'hooks/api/getters/useRole/useRole';
import UserIcon from '@mui/icons-material/Person';
import { RoleDescription } from 'component/common/RoleDescription/RoleDescription';

interface IRoleBadgeProps {
    roleId: number;
    hideIcon?: boolean;
    children?: string;
}

export const RoleBadge = ({ roleId, hideIcon, children }: IRoleBadgeProps) => {
    const { role } = useRole(roleId.toString());

    const icon = hideIcon ? undefined : <UserIcon />;

    if (!role) {
        if (children)
            return (
                <Badge color='success' icon={icon}>
                    {children}
                </Badge>
            );
        return null;
    }

    return (
        <HtmlTooltip title={<RoleDescription roleId={roleId} tooltip />} arrow>
            <Badge
                tabIndex={0}
                color='success'
                icon={icon}
                sx={{ cursor: 'pointer' }}
            >
                {role.name}
            </Badge>
        </HtmlTooltip>
    );
};
