import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { IEnvironment } from 'interfaces/environments';
import { formatUnknownError } from 'utils/formatUnknownError';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import usePermissions from 'hooks/api/getters/usePermissions/usePermissions';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import useToast from 'hooks/useToast';
import { EnvironmentActionCellPopover } from './EnvironmentActionCellPopover/EnvironmentActionCellPopover';
import { EnvironmentCloneModal } from './EnvironmentCloneModal/EnvironmentCloneModal';
import { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { EnvironmentTokenDialog } from './EnvironmentTokenDialog/EnvironmentTokenDialog';
import { ENV_LIMIT } from 'constants/values';
import { EnvironmentDeprecateToggleDialog } from './EnvironmentDeprecateToggleDialog/EnvironmentDeprecateToggleDialog';
import { EnvironmentDeleteDialog } from './EnvironmentDeleteDialog/EnvironmentDeleteDialog';

interface IEnvironmentTableActionsProps {
    environment: IEnvironment;
}

export const EnvironmentActionCell = ({
    environment,
}: IEnvironmentTableActionsProps) => {
    const navigate = useNavigate();
    const { setToastApiError, setToastData } = useToast();
    const { environments, refetchEnvironments } = useEnvironments();
    const { refetch: refetchPermissions } = usePermissions();
    const { deleteEnvironment, toggleEnvironmentOn, toggleEnvironmentOff } =
        useEnvironmentApi();

    const [deleteDialog, setDeleteDialog] = useState(false);
    const [deprecateToggleDialog, setDeprecateToggleDialog] = useState(false);
    const [cloneModal, setCloneModal] = useState(false);
    const [tokenDialog, setTokenDialog] = useState(false);
    const [newToken, setNewToken] = useState<IApiToken>();

    const onDeleteConfirm = async () => {
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
            setDeleteDialog(false);
            await refetchEnvironments();
        }
    };

    const onDeprecateToggleConfirm = async () => {
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
            setDeprecateToggleDialog(false);
            await refetchEnvironments();
        }
    };

    return (
        <ActionCell>
            <EnvironmentActionCellPopover
                environment={environment}
                onEdit={() => navigate(`/environments/${environment.name}`)}
                onDeprecateToggle={() => setDeprecateToggleDialog(true)}
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
                onDelete={() => setDeleteDialog(true)}
            />
            <EnvironmentDeleteDialog
                environment={environment}
                open={deleteDialog}
                setOpen={setDeleteDialog}
                onConfirm={onDeleteConfirm}
            />
            <EnvironmentDeprecateToggleDialog
                environment={environment}
                open={deprecateToggleDialog}
                setOpen={setDeprecateToggleDialog}
                onConfirm={onDeprecateToggleConfirm}
            />
            <EnvironmentCloneModal
                environment={environment}
                open={cloneModal}
                setOpen={setCloneModal}
                newToken={(token: IApiToken) => {
                    setNewToken(token);
                    setTokenDialog(true);
                }}
            />
            <EnvironmentTokenDialog
                open={tokenDialog}
                setOpen={setTokenDialog}
                token={newToken}
            />
        </ActionCell>
    );
};
