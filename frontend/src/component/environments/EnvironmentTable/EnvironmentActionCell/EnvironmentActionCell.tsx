import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { IEnvironment } from 'interfaces/environments';
import { formatUnknownError } from 'utils/formatUnknownError';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import usePermissions from 'hooks/api/getters/usePermissions/usePermissions';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import useToast from 'hooks/useToast';
import { EnvironmentActionCellPopover } from './EnvironmentActionCellPopover/EnvironmentActionCellPopover.tsx';
import { EnvironmentCloneModal } from './EnvironmentCloneModal/EnvironmentCloneModal.tsx';
import type { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { EnvironmentTokenDialog } from './EnvironmentTokenDialog/EnvironmentTokenDialog.tsx';
import { EnvironmentDeprecateToggleDialog } from './EnvironmentDeprecateToggleDialog/EnvironmentDeprecateToggleDialog.tsx';
import { EnvironmentDeleteDialog } from './EnvironmentDeleteDialog/EnvironmentDeleteDialog.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface IEnvironmentTableActionsProps {
    environment: IEnvironment;
}

export const EnvironmentActionCell = ({
    environment,
}: IEnvironmentTableActionsProps) => {
    const navigate = useNavigate();
    const { uiConfig } = useUiConfig();
    const environmentLimit = uiConfig.resourceLimits.environments;
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
                text: `Environment deleted`,
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
                    text: 'Environment deprecated',
                });
            } else {
                await toggleEnvironmentOn(environment.name);
                setToastData({
                    type: 'success',
                    text: 'Environment undeprecated',
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
                    if (environments.length < environmentLimit) {
                        setCloneModal(true);
                    } else {
                        setToastData({
                            type: 'error',
                            text: `Environment limit (${environmentLimit}) reached`,
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
