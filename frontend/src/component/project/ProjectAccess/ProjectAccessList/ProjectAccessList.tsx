import { List } from '@material-ui/core';
import {
    IProjectAccessOutput,
    IProjectAccessUser,
} from '../../../../hooks/api/getters/useProjectAccess/useProjectAccess';
import { ProjectAccessListItem } from './ProjectAccessListItem/ProjectAccessListItem';
import React from 'react';

interface IProjectAccesListProps {
    page: IProjectAccessUser[];
    handleRoleChange: (
        userId: number,
        currRoleId: number
    ) => (
        evt: React.ChangeEvent<{
            name?: string;
            value: unknown;
        }>
    ) => void;
    handleRemoveAccess: (user: IProjectAccessUser) => void;
    access: IProjectAccessOutput;
}

export const ProjectAccessList: React.FC<IProjectAccesListProps> = ({
    page,
    access,
    handleRoleChange,
    handleRemoveAccess,
    children,
}) => {
    const sortUsers = (users: IProjectAccessUser[]): IProjectAccessUser[] => {
        /* This should be done on the API side in the future,
                we should expect the list of users to come in the
                same order each time and not jump around on the screen*/

        return users.sort(
            (userA: IProjectAccessUser, userB: IProjectAccessUser) => {
                if (!userA.name) {
                    return -1;
                } else if (!userB.name) {
                    return 1;
                }

                return userA.name.localeCompare(userB.name);
            }
        );
    };

    return (
        <List>
            {sortUsers(page).map(user => {
                return (
                    <ProjectAccessListItem
                        key={user.id}
                        user={user}
                        access={access}
                        handleRoleChange={handleRoleChange}
                        handleRemoveAccess={handleRemoveAccess}
                    />
                );
            })}
            {children}
        </List>
    );
};
