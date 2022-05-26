import { VFC } from 'react';
import { Box, MenuItem, SelectChangeEvent } from '@mui/material';
import { IProjectAccessUser } from 'hooks/api/getters/useProjectAccess/useProjectAccess';
import { IProjectRole } from 'interfaces/role';
import { ProjectRoleSelect } from '../../ProjectRoleSelect/ProjectRoleSelect';
import { useStyles } from './ProjectRoleCell.styles';

interface IProjectRoleCellProps {
    value: number;
    user: IProjectAccessUser;
    roles: IProjectRole[];
    onChange: (event: SelectChangeEvent) => Promise<void>;
}

export const ProjectRoleCell: VFC<IProjectRoleCellProps> = ({
    value,
    user,
    roles,
    onChange,
}) => {
    const { classes } = useStyles();
    return (
        <Box className={classes.cell}>
            <ProjectRoleSelect
                id={`role-${user.id}-select`}
                key={user.id}
                placeholder="Choose role"
                onChange={onChange}
                roles={roles}
                value={value || -1}
            >
                <MenuItem value="" disabled>
                    Choose role
                </MenuItem>
            </ProjectRoleSelect>
        </Box>
    );
};
