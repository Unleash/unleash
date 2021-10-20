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
import EditEnvironment from '../EditEnvironment/EditEnvironment';
import EnvironmentToggleConfirm from './EnvironmentToggleConfirm/EnvironmentToggleConfirm';

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
    const [editEnvironment, setEditEnvironment] = useState(false);

    const [selectedEnv, setSelectedEnv] = useState(defaultEnv);
    const [delDialog, setDeldialogue] = useState(false);
    const [toggleDialog, setToggleDialog] = useState(false);
    const [confirmName, setConfirmName] = useState('');

    const history = useHistory();
    const { toast, setToastData } = useToast();
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
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
        }
    };

    const sortOrderAPICall = async (sortOrder: ISortOrderPayload) => {
        try {
            await changeSortOrder(sortOrder);
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
        }
    };

    const handleDeleteEnvironment = async () => {
        try {
            await deleteEnvironment(selectedEnv.name);
            setToastData({
                show: true,
                type: 'success',
                text: 'Successfully deleted environment.',
            });
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
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
                show: true,
                type: 'success',
                text: 'Successfully enabled environment.',
            });
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
        } finally {
            refetch();
        }
    };

    const handleToggleEnvironmentOff = async () => {
        try {
            await toggleEnvironmentOff(selectedEnv.name);
            setToggleDialog(false);
            setToastData({
                show: true,
                type: 'success',
                text: 'Successfully disabled environment.',
            });
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
        } finally {
            refetch();
        }
    };

    const environmentList = () =>
        environments.map((env: IEnvironment, index: number) => (
            <EnvironmentListItem
                key={env.name}
                env={env}
                setEditEnvironment={setEditEnvironment}
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
                                tooltip="Add environment"
                                Icon={Add}
                            >
                                Add Environment
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

            <EditEnvironment
                env={selectedEnv}
                setEditEnvironment={setEditEnvironment}
                editEnvironment={editEnvironment}
                setToastData={setToastData}
            />
            <EnvironmentToggleConfirm
                env={selectedEnv}
                open={toggleDialog}
                setToggleDialog={setToggleDialog}
                handleConfirmToggleEnvironment={handleConfirmToggleEnvironment}
            />
            {toast}
        </PageContent>
    );
};

export default EnvironmentList;
