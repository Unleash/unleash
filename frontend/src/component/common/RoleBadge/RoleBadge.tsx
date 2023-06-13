import { Badge } from 'component/common/Badge/Badge';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { useRole } from 'hooks/api/getters/useRole/useRole';
import { Person as UserIcon } from '@mui/icons-material';
import { RoleDescription } from 'component/common/RoleDescription/RoleDescription';

interface IRoleBadgeProps {
    roleId: number;
}

export const RoleBadge = ({ roleId }: IRoleBadgeProps) => {
    const { role } = useRole(roleId.toString());

    if (!role) return null;

    return (
        <HtmlTooltip title={<RoleDescription roleId={roleId} tooltip />}>
            <Badge color="success" icon={<UserIcon />}>
                {role.name}
            </Badge>
        </HtmlTooltip>
    );
};
