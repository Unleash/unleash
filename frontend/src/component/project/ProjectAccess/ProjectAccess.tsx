/* eslint-disable react/jsx-no-target-blank */
import React, { useState } from 'react';
import { Alert } from '@material-ui/lab';

import { ProjectAccessAddUser } from './ProjectAccessAddUser/ProjectAccessAddUser';

import PageContent from '../../common/PageContent';
import useUiConfig from '../../../hooks/api/getters/useUiConfig/useUiConfig';
import { useStyles } from './ProjectAccess.styles';
import { useParams } from 'react-router-dom';
import { IProjectViewParams } from '../../../interfaces/params';
import usePagination from '../../../hooks/usePagination';
import PaginateUI from '../../common/PaginateUI/PaginateUI';
import useToast from '../../../hooks/useToast';
import ConfirmDialogue from '../../common/Dialogue';
import useProjectAccess, {
    IProjectAccessUser,
} from '../../../hooks/api/getters/useProjectAccess/useProjectAccess';
import useProjectApi from '../../../hooks/api/actions/useProjectApi/useProjectApi';
import HeaderTitle from '../../common/HeaderTitle';
import { ProjectAccessList } from './ProjectAccessList/ProjectAccessList';

export const ProjectAccess = () => {
    const { id: projectId } = useParams<IProjectViewParams>();
    const styles = useStyles();
    const { access, refetchProjectAccess } = useProjectAccess(projectId);
    const { setToastData } = useToast();
    const { isOss } = useUiConfig();
    const { page, pages, nextPage, prevPage, setPageIndex, pageIndex } =
        usePagination(access.users, 10);
    const { removeUserFromRole, addUserToRole } = useProjectApi();
    const [showDelDialogue, setShowDelDialogue] = useState(false);
    const [user, setUser] = useState<IProjectAccessUser | undefined>();

    if (isOss()) {
        return (
            <PageContent headerContent={<HeaderTitle title="Project Access" />}>
                <Alert severity="error">
                    Controlling access to projects requires a paid version of
                    Unleash. Check out{' '}
                    <a href="https://www.getunleash.io" target="_blank">
                        getunleash.io
                    </a>{' '}
                    to find out more.
                </Alert>
            </PageContent>
        );
    }

    const handleRoleChange =
        (userId: number, currRoleId: number) =>
        async (
            evt: React.ChangeEvent<{
                name?: string;
                value: unknown;
            }>
        ) => {
            const roleId = Number(evt.target.value);
            try {
                await removeUserFromRole(projectId, currRoleId, userId);
                await addUserToRole(projectId, roleId, userId);
                refetchProjectAccess();

                setToastData({
                    type: 'success',
                    title: 'User role changed successfully',
                });
            } catch (err: any) {
                setToastData({
                    type: 'error',
                    title: err.message || 'Server problems when adding users.',
                });
            }
        };

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
            headerContent={<HeaderTitle title="Project Roles"></HeaderTitle>}
            className={styles.pageContent}
        >
            <ProjectAccessAddUser roles={access?.roles} />

            <div className={styles.divider}></div>
            <ProjectAccessList
                handleRoleChange={handleRoleChange}
                handleRemoveAccess={handleRemoveAccess}
                page={page}
                access={access}
            >
                <PaginateUI
                    pages={pages}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                    nextPage={nextPage}
                    prevPage={prevPage}
                    style={{ bottom: '-21px' }}
                />
            </ProjectAccessList>

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
