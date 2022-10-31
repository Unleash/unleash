import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { UPDATE_ENVIRONMENT } from 'component/providers/AccessProvider/permissions';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { IEnvironment } from 'interfaces/environments';
import { formatUnknownError } from 'utils/formatUnknownError';
import EnvironmentToggleConfirm from '../../EnvironmentToggleConfirm/EnvironmentToggleConfirm';
import EnvironmentDeleteConfirm from '../../EnvironmentDeleteConfirm/EnvironmentDeleteConfirm';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import useProjectRolePermissions from 'hooks/api/getters/useProjectRolePermissions/useProjectRolePermissions';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import useToast from 'hooks/useToast';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { EnvironmentActionCellPopover } from './EnvironmentActionCellPopover/EnvironmentActionCellPopover';
import { EnvironmentCloneModal } from './EnvironmentCloneModal/EnvironmentCloneModal';
import { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { EnvironmentTokenDialog } from './EnvironmentTokenDialog/EnvironmentTokenDialog';
import { ENV_LIMIT } from 'constants/values';

interface IEnvironmentTableActionsProps {
    environment: IEnvironment;
}

export const EnvironmentActionCell = ({
    environment,
}: IEnvironmentTableActionsProps) => {
    const navigate = useNavigate();
    const { setToastApiError, setToastData } = useToast();
    const { environments, refetchEnvironments } = useEnvironments();
    const { refetch: refetchPermissions } = useProjectRolePermissions();
    const { deleteEnvironment, toggleEnvironmentOn, toggleEnvironmentOff } =
        useEnvironmentApi();

    const [deleteModal, setDeleteModal] = useState(false);
    const [toggleModal, setToggleModal] = useState(false);
    const [cloneModal, setCloneModal] = useState(false);
    const [tokenModal, setTokenModal] = useState(false);
    const [newToken, setNewToken] = useState<IApiToken>();
    const [confirmName, setConfirmName] = useState('');

    const handleDeleteEnvironment = async () => {
        try {
            await deleteEnvironment(environment.name);
            refetchPermissions();
            setToastData({
                type: 'success',
                title: 'Environment deleted',
                text: `You have successfully deleted the ${environment.name} environment.`,
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setDeleteModal(false);
            setConfirmName('');
            await refetchEnvironments();
        }
    };

    const handleConfirmToggleEnvironment = () => {
        return environment.enabled
            ? handleToggleEnvironmentOff()
            : handleToggleEnvironmentOn();
    };

    const handleToggleEnvironmentOn = async () => {
        try {
            setToggleModal(false);
            await toggleEnvironmentOn(environment.name);
            setToastData({
                type: 'success',
                title: 'Project environment enabled',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            await refetchEnvironments();
        }
    };

    const handleToggleEnvironmentOff = async () => {
        try {
            setToggleModal(false);
            await toggleEnvironmentOff(environment.name);
            setToastData({
                type: 'success',
                title: 'Project environment disabled',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            await refetchEnvironments();
        }
    };

    return (
        <ActionCell>
            <PermissionSwitch
                permission={UPDATE_ENVIRONMENT}
                checked={environment.enabled}
                disabled={environment.protected}
                tooltip={
                    environment.enabled
                        ? `Disable environment ${environment.name}`
                        : `Enable environment ${environment.name}`
                }
                onClick={() => setToggleModal(true)}
            />
            <ActionCell.Divider />
            <EnvironmentActionCellPopover
                environment={environment}
                onEdit={() => navigate(`/environments/${environment.name}`)}
                onClone={() => {
                    if (environments.length < ENV_LIMIT) {
                        setCloneModal(true);
                    } else {
                        setToastData({
                            type: 'error',
                            title: 'Environment limit reached',
                            text: `You have reached the maximum number of environments (${ENV_LIMIT}). Please reach out if you need more.`,
                        });
                    }
                }}
                onDelete={() => setDeleteModal(true)}
            />
            <EnvironmentDeleteConfirm
                env={environment}
                setDeldialogue={setDeleteModal}
                open={deleteModal}
                handleDeleteEnvironment={handleDeleteEnvironment}
                confirmName={confirmName}
                setConfirmName={setConfirmName}
            />
            <EnvironmentToggleConfirm
                env={environment}
                open={toggleModal}
                setToggleDialog={setToggleModal}
                handleConfirmToggleEnvironment={handleConfirmToggleEnvironment}
            />
            <EnvironmentCloneModal
                environment={environment}
                open={cloneModal}
                setOpen={setCloneModal}
                newToken={(token: IApiToken) => {
                    setNewToken(token);
                    setTokenModal(true);
                }}
            />
            <EnvironmentTokenDialog
                open={tokenModal}
                setOpen={setTokenModal}
                token={newToken}
            />
        </ActionCell>
    );
};
