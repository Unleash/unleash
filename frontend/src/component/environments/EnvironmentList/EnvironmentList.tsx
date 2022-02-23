import HeaderTitle from '../../common/HeaderTitle';
import ResponsiveButton from '../../common/ResponsiveButton/ResponsiveButton';
import { Add } from '@material-ui/icons';
import PageContent from '../../common/PageContent';
import { List } from '@material-ui/core';
import useEnvironments, {
    ENVIRONMENT_CACHE_KEY,
} from '../../../hooks/api/getters/useEnvironments/useEnvironments';
import {
    IEnvironment,
    ISortOrderPayload,
} from '../../../interfaces/environments';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import EnvironmentDeleteConfirm from './EnvironmentDeleteConfirm/EnvironmentDeleteConfirm';
import useToast from '../../../hooks/useToast';
import useEnvironmentApi from '../../../hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import EnvironmentListItem from './EnvironmentListItem/EnvironmentListItem';
import { mutate } from 'swr';
import EnvironmentToggleConfirm from './EnvironmentToggleConfirm/EnvironmentToggleConfirm';
import useProjectRolePermissions from '../../../hooks/api/getters/useProjectRolePermissions/useProjectRolePermissions';

const EnvironmentList = () => {
    const defaultEnv = {
        name: '',
        type: '',
        sortOrder: 0,
        createdAt: '',
        enabled: true,
        protected: false,
    };
    const { environments, refetch } = useEnvironments();
    const { refetch: refetchProjectRolePermissions } =
        useProjectRolePermissions();

    const [selectedEnv, setSelectedEnv] = useState(defaultEnv);
    const [delDialog, setDeldialogue] = useState(false);
    const [toggleDialog, setToggleDialog] = useState(false);
    const [confirmName, setConfirmName] = useState('');

    const history = useHistory();
    const { setToastApiError, setToastData } = useToast();
    const {
        deleteEnvironment,
        changeSortOrder,
        toggleEnvironmentOn,
        toggleEnvironmentOff,
    } = useEnvironmentApi();

    const moveListItem = (dragIndex: number, hoverIndex: number) => {
        const newEnvList = [...environments];
        if (newEnvList.length === 0) return newEnvList;

        const item = newEnvList.splice(dragIndex, 1)[0];

        newEnvList.splice(hoverIndex, 0, item);

        mutate(ENVIRONMENT_CACHE_KEY, { environments: newEnvList }, false);
        return newEnvList;
    };

    const moveListItemApi = async (dragIndex: number, hoverIndex: number) => {
        const newEnvList = moveListItem(dragIndex, hoverIndex);
        const sortOrder = newEnvList.reduce(
            (acc: ISortOrderPayload, env: IEnvironment, index: number) => {
                acc[env.name] = index + 1;
                return acc;
            },
            {}
        );

        try {
            await sortOrderAPICall(sortOrder);
            refetch();
        } catch (e) {
            setToastApiError(e.toString());
        }
    };

    const sortOrderAPICall = async (sortOrder: ISortOrderPayload) => {
        try {
            await changeSortOrder(sortOrder);
        } catch (e) {
            setToastApiError(e.toString());
        }
    };

    const handleDeleteEnvironment = async () => {
        try {
            await deleteEnvironment(selectedEnv.name);
            refetchProjectRolePermissions();
            setToastData({
                type: 'success',
                title: 'Project environment deleted',
                text: 'You have successfully deleted the project environment.',
            });
        } catch (e) {
            setToastApiError(e.toString());
        } finally {
            setDeldialogue(false);
            setSelectedEnv(defaultEnv);
            setConfirmName('');
            refetch();
        }
    };

    const handleConfirmToggleEnvironment = () => {
        if (selectedEnv.enabled) {
            return handleToggleEnvironmentOff();
        }
        handleToggleEnvironmentOn();
    };

    const handleToggleEnvironmentOn = async () => {
        try {
            await toggleEnvironmentOn(selectedEnv.name);
            setToggleDialog(false);

            setToastData({
                type: 'success',
                title: 'Project environment enabled',
                text: 'Your environment is enabled',
            });
        } catch (e) {
            setToastApiError(e.toString());
        } finally {
            refetch();
        }
    };

    const handleToggleEnvironmentOff = async () => {
        try {
            await toggleEnvironmentOff(selectedEnv.name);
            setToggleDialog(false);
            setToastData({
                type: 'success',
                title: 'Project environment disabled',
                text: 'Your environment is disabled.',
            });
        } catch (e) {
            setToastApiError(e.toString());
        } finally {
            refetch();
        }
    };

    const environmentList = () =>
        environments.map((env: IEnvironment, index: number) => (
            <EnvironmentListItem
                key={env.name}
                env={env}
                setDeldialogue={setDeldialogue}
                setSelectedEnv={setSelectedEnv}
                setToggleDialog={setToggleDialog}
                index={index}
                moveListItem={moveListItem}
                moveListItemApi={moveListItemApi}
            />
        ));

    const navigateToCreateEnvironment = () => {
        history.push('/environments/create');
    };

    return (
        <PageContent
            headerContent={
                <HeaderTitle
                    title="Environments"
                    actions={
                        <>
                            <ResponsiveButton
                                onClick={navigateToCreateEnvironment}
                                maxWidth="700px"
                                Icon={Add}
                            >
                                New Environment
                            </ResponsiveButton>
                        </>
                    }
                />
            }
        >
            <List>{environmentList()}</List>
            <EnvironmentDeleteConfirm
                env={selectedEnv}
                setSelectedEnv={setSelectedEnv}
                setDeldialogue={setDeldialogue}
                open={delDialog}
                handleDeleteEnvironment={handleDeleteEnvironment}
                confirmName={confirmName}
                setConfirmName={setConfirmName}
            />
            <EnvironmentToggleConfirm
                env={selectedEnv}
                open={toggleDialog}
                setToggleDialog={setToggleDialog}
                handleConfirmToggleEnvironment={handleConfirmToggleEnvironment}
            />
        </PageContent>
    );
};

export default EnvironmentList;
