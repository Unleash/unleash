import { VFC } from 'react';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { RoleDescription } from 'component/common/RoleDescription/RoleDescription';

interface IRoleCellProps {
    roleId: number;
    value: string;
}

export const RoleCell: VFC<IRoleCellProps> = ({ roleId, value }) => (
    <TextCell>
        <TooltipLink tooltip={<RoleDescription roleId={roleId} tooltip />}>
            {value}
        </TooltipLink>
    </TextCell>
);
