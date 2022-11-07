import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { IEnvironment } from 'interfaces/environments';
import { formatUnknownError } from 'utils/formatUnknownError';
import EnvironmentDeleteConfirm from '../../EnvironmentDeleteConfirm/EnvironmentDeleteConfirm';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import useProjectRolePermissions from 'hooks/api/getters/useProjectRolePermissions/useProjectRolePermissions';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import useToast from 'hooks/useToast';
import { EnvironmentActionCellPopover } from './EnvironmentActionCellPopover/EnvironmentActionCellPopover';
import { EnvironmentCloneModal } from './EnvironmentCloneModal/EnvironmentCloneModal';
import { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { EnvironmentTokenDialog } from './EnvironmentTokenDialog/EnvironmentTokenDialog';
import { ENV_LIMIT } from 'constants/values';
import { EnvironmentDeprecateToggleDialog } from './EnvironmentDeprecateToggleDialog/EnvironmentDeprecateToggleDialog';

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
    const [deprecateToggleModal, setDeprecateToggleModal] = useState(false);
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

    const onDeprecateToggleConfirm = async () => {
        setDeprecateToggleModal(false);
        try {
            if (environment.enabled) {
                await toggleEnvironmentOff(environment.name);
                setToastData({
                    type: 'success',
                    title: 'Environment deprecated successfully',
                });
            } else {
                await toggleEnvironmentOn(environment.name);
                setToastData({
                    type: 'success',
                    title: 'Environment undeprecated successfully',
                });
            }
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            await refetchEnvironments();
        }
    };

    return (
        <ActionCell>
            <EnvironmentActionCellPopover
                environment={environment}
                onEdit={() => navigate(`/environments/${environment.name}`)}
                onDeprecateToggle={() => setDeprecateToggleModal(true)}
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
            <EnvironmentDeprecateToggleDialog
                environment={environment}
                open={deprecateToggleModal}
                setOpen={setDeprecateToggleModal}
                onConfirm={onDeprecateToggleConfirm}
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
