import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { VFC } from 'react';
import { ProjectRoleDescription } from 'component/project/ProjectAccess/ProjectAccessAssign/ProjectRoleDescription/ProjectRoleDescription';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';

interface IProjectAccessRoleCellProps {
    roleId: number;
    projectId: string;
    value?: string;
    emptyText?: string;
}

export const ProjectAccessRoleCell: VFC<IProjectAccessRoleCellProps> = ({
    roleId,
    projectId,
    value,
    emptyText,
}) => {
    if (!value) return <TextCell>{emptyText}</TextCell>;

    return (
        <TextCell>
            <TooltipLink
                tooltip={
                    <ProjectRoleDescription
                        roleId={roleId}
                        projectId={projectId}
                        popover
                    />
                }
                tooltipProps={{
                    maxWidth: 500,
                    maxHeight: 600,
                }}
            >
                {value}
            </TooltipLink>
        </TextCell>
    );
};
