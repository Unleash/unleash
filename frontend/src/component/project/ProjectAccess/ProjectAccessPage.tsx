import React, { useCallback, useState } from 'react';
import { SelectChangeEvent } from '@mui/material';
import { ProjectAccessAddUser } from './ProjectAccessAddUser/ProjectAccessAddUser';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useStyles } from './ProjectAccess.styles';
import useToast from 'hooks/useToast';
import { Dialogue as ConfirmDialogue } from 'component/common/Dialogue/Dialogue';
import useProjectAccess, {
    IProjectAccessUser,
} from 'hooks/api/getters/useProjectAccess/useProjectAccess';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ProjectAccessTable } from './ProjectAccessTable/ProjectAccessTable';

export const ProjectAccessPage = () => {
    const projectId = useRequiredPathParam('projectId');
    const { classes: styles } = useStyles();
    const { access, refetchProjectAccess } = useProjectAccess(projectId);
    const { setToastData } = useToast();
    const { removeUserFromRole, changeUserRole } = useProjectApi();
    const [showDelDialogue, setShowDelDialogue] = useState(false);
    const [user, setUser] = useState<IProjectAccessUser | undefined>();

    const handleRoleChange = useCallback(
        (userId: number) => async (evt: SelectChangeEvent) => {
            const roleId = Number(evt.target.value);
            try {
                await changeUserRole(projectId, roleId, userId);
                refetchProjectAccess();
                setToastData({
                    type: 'success',
                    title: 'Success',
                    text: 'User role changed successfully',
                });
            } catch (err: any) {
                setToastData({
                    type: 'error',
                    title: err.message || 'Server problems when adding users.',
                });
            }
        },
        [changeUserRole, projectId, refetchProjectAccess, setToastData]
    );

    const handleRemoveAccess = (user: IProjectAccessUser) => {
        setUser(user);
        setShowDelDialogue(true);
    };

    const removeAccess = (user: IProjectAccessUser | undefined) => async () => {
        if (!user) return;
        const { id, roleId } = user;

        try {
            await removeUserFromRole(projectId, roleId, id);
            refetchProjectAccess();
            setToastData({
                type: 'success',
                title: 'The user has been removed from project',
            });
        } catch (err: any) {
            setToastData({
                type: 'error',
                title: err.message || 'Server problems when adding users.',
            });
        }
        setShowDelDialogue(false);
    };

    return (
        <PageContent
            header={<PageHeader title="Project roles" />}
            className={styles.pageContent}
        >
            <ProjectAccessAddUser roles={access?.roles} />
            <div className={styles.divider} />
            <ProjectAccessTable
                access={access}
                handleRoleChange={handleRoleChange}
                handleRemoveAccess={handleRemoveAccess}
                projectId={projectId}
            />
            <ConfirmDialogue
                open={showDelDialogue}
                onClick={removeAccess(user)}
                onClose={() => {
                    setUser(undefined);
                    setShowDelDialogue(false);
                }}
                title="Really remove user from this project"
            />
        </PageContent>
    );
};
