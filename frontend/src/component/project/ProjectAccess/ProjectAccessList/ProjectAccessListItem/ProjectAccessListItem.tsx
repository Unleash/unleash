import {
    Avatar,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    SelectChangeEvent,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import {
    IProjectAccessOutput,
    IProjectAccessUser,
} from 'hooks/api/getters/useProjectAccess/useProjectAccess';
import { IProjectViewParams } from 'interfaces/params';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { ProjectRoleSelect } from 'component/project/ProjectAccess/ProjectRoleSelect/ProjectRoleSelect';
import { useStyles } from '../ProjectAccessListItem/ProjectAccessListItem.styles';
import React from 'react';

interface IProjectAccessListItemProps {
    user: IProjectAccessUser;
    handleRoleChange: (userId: number) => (evt: SelectChangeEvent) => void;
    handleRemoveAccess: (user: IProjectAccessUser) => void;
    access: IProjectAccessOutput;
}

export const ProjectAccessListItem = ({
    user,
    access,
    handleRoleChange,
    handleRemoveAccess,
}: IProjectAccessListItemProps) => {
    const { id: projectId } = useParams<IProjectViewParams>();
    const { classes: styles } = useStyles();

    const labelId = `checkbox-list-secondary-label-${user.id}`;

    return (
        <ListItem key={user.id} button>
            <ListItemAvatar>
                <Avatar alt="Gravatar" src={user.imageUrl} />
            </ListItemAvatar>
            <ListItemText
                id={labelId}
                primary={user.name}
                secondary={user.email || user.username}
            />
            <ListItemSecondaryAction className={styles.actionList}>
                <ProjectRoleSelect
                    labelId={`role-${user.id}-select-label`}
                    id={`role-${user.id}-select`}
                    key={user.id}
                    placeholder="Choose role"
                    onChange={handleRoleChange(user.id)}
                    roles={access.roles}
                    value={user.roleId || -1}
                >
                    <MenuItem value="" disabled>
                        Choose role
                    </MenuItem>
                </ProjectRoleSelect>
                <PermissionIconButton
                    permission={UPDATE_PROJECT}
                    projectId={projectId}
                    className={styles.iconButton}
                    edge="end"
                    onClick={() => handleRemoveAccess(user)}
                    disabled={access.users.length === 1}
                    tooltip="Remove access"
                >
                    <Delete />
                </PermissionIconButton>
            </ListItemSecondaryAction>
        </ListItem>
    );
};
