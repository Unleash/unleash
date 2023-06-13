import { VFC } from 'react';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import IRole from 'interfaces/role';
import { useRole } from 'hooks/api/getters/useRole/useRole';
import { RoleDescription } from 'component/common/RoleDescription/RoleDescription';

interface IRolePermissionsCellProps {
    row: { original: IRole };
}

export const RolePermissionsCell: VFC<IRolePermissionsCellProps> = ({
    row,
}) => {
    const { original: rowRole } = row;
    const { role } = useRole(rowRole.id.toString());

    if (!role || role.type === 'root') return null;

    return (
        <TextCell>
            <TooltipLink
                tooltip={<RoleDescription roleId={rowRole.id} tooltip />}
            >
                {role.permissions?.length === 1
                    ? '1 permission'
                    : `${role.permissions?.length} permissions`}
            </TooltipLink>
        </TextCell>
    );
};
