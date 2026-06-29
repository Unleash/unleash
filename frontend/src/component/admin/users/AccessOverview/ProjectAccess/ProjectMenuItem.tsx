import type { ProjectSchema } from 'openapi';
import { Checkbox, ListItemText, MenuItem } from '@mui/material';

export const ProjectMenuItem = ({
    id,
    project,
    selected,
    ...props
}: {
    id: string;
    project: ProjectSchema;
    selected: boolean;
    [key: string]: unknown;
}) => {
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
