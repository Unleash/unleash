import { Badge } from 'component/common/Badge/Badge';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { useRole } from 'hooks/api/getters/useRole/useRole';
import { Person as UserIcon } from '@mui/icons-material';
import { RoleDescription } from 'component/common/RoleDescription/RoleDescription';

interface IRoleBadgeProps {
    roleId: number;
    children?: string;
}

export const RoleBadge = ({ roleId, children }: IRoleBadgeProps) => {
    const { role } = useRole(roleId.toString());

    if (!role) {
        if (children)
            return (
                <Badge color="success" icon={<UserIcon />}>
                    {children}
                </Badge>
            );
        return null;
    }

    return (
        <HtmlTooltip title={<RoleDescription roleId={roleId} tooltip />} arrow>
            <Badge
                color="success"
                icon={<UserIcon />}
                sx={{ cursor: 'pointer' }}
            >
                {role.name}
            </Badge>
        </HtmlTooltip>
    );
};
