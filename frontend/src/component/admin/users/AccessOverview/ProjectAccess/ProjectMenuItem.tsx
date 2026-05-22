import { useUserAccessOverview } from 'hooks/api/getters/useUserAccessOverview/useUserAccessOverview';
import type { ProjectSchema } from 'openapi';
import { useEffect } from 'react';
import { Checkbox, ListItemText, MenuItem } from '@mui/material';

export const ProjectMenuItem = ({
    id,
    project,
    selected,
    onAccessResolved,
    ...props
}: {
    id: string;
    project: ProjectSchema;
    selected: boolean;
    onAccessResolved: (projectId: string, isMember: boolean) => void;
    [key: string]: unknown;
}) => {
    const { projectRoles } = useUserAccessOverview(id, project.id);
    const isMember = Boolean(projectRoles?.length);

    useEffect(() => {
        if (projectRoles !== undefined) {
            onAccessResolved(project.id, isMember);
        }
    }, [project.id, projectRoles, isMember, onAccessResolved]);

    return (
        <MenuItem {...props} value={project.id}>
            <Checkbox checked={selected} size='small' />
            <ListItemText
                primary={project.name}
                sx={{
                    '& .MuiListItemText-primary': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    },
                }}
            />
        </MenuItem>
    );
};
