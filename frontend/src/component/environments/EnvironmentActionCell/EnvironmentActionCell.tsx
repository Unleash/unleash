import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import {
    DELETE_ENVIRONMENT,
    UPDATE_ENVIRONMENT,
} from 'component/providers/AccessProvider/permissions';
import {
    Edit,
    Delete,
    DragIndicator,
    PowerSettingsNew,
} from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccessContext from 'contexts/AccessContext';
import { useContext, useState } from 'react';
import { IEnvironment } from 'interfaces/environments';
import { formatUnknownError } from 'utils/formatUnknownError';
import EnvironmentToggleConfirm from '../EnvironmentToggleConfirm/EnvironmentToggleConfirm';
import EnvironmentDeleteConfirm from '../EnvironmentDeleteConfirm/EnvironmentDeleteConfirm';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import useProjectRolePermissions from 'hooks/api/getters/useProjectRolePermissions/useProjectRolePermissions';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import useToast from 'hooks/useToast';
import { useId } from 'hooks/useId';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';

interface IEnvironmentTableActionsProps {
    environment: IEnvironment;
}

export const EnvironmentActionCell = ({
    environment,
}: IEnvironmentTableActionsProps) => {
    const navigate = useNavigate();
    const { hasAccess } = useContext(AccessContext);
    const updatePermission = hasAccess(UPDATE_ENVIRONMENT);
    const { searchQuery } = useSearchHighlightContext();

    const { setToastApiError, setToastData } = useToast();
    const { refetchEnvironments } = useEnvironments();
    const { refetch: refetchPermissions } = useProjectRolePermissions();
    const { deleteEnvironment, toggleEnvironmentOn, toggleEnvironmentOff } =
        useEnvironmentApi();

    const [deleteModal, setDeleteModal] = useState(false);
    const [toggleModal, setToggleModal] = useState(false);
    const [confirmName, setConfirmName] = useState('');

    const handleDeleteEnvironment = async () => {
        try {
            await deleteEnvironment(environment.name);
            refetchPermissions();
            setToastData({
                type: 'success',
                title: 'Project environment deleted',
                text: 'You have successfully deleted the project environment.',
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
            await toggleEnvironmentOn(environment.name);
            setToggleModal(false);
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
            await toggleEnvironmentOff(environment.name);
            setToggleModal(false);
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

    const toggleIconTooltip = environment.enabled
        ? 'Disable environment'
        : 'Enable environment';

    const editId = useId();
    const deleteId = useId();

    // Allow drag and drop if the user is permitted to reorder environments.
    // Disable drag and drop while searching since some rows may be hidden.
    const enableDragAndDrop = updatePermission && !searchQuery;

    return (
        <ActionCell>
            <ConditionallyRender
                condition={enableDragAndDrop}
                show={
                    <IconButton size="large">
                        <DragIndicator titleAccess="Drag" cursor="grab" />
                    </IconButton>
                }
            />
            <ConditionallyRender
                condition={updatePermission}
                show={
                    <Tooltip title={toggleIconTooltip} arrow>
                        <IconButton
                            onClick={() => setToggleModal(true)}
                            size="large"
                        >
                            <PowerSettingsNew />
                        </IconButton>
                    </Tooltip>
                }
            />
            <ConditionallyRender
                condition={updatePermission}
                show={
                    <Tooltip
                        title={
                            environment.protected
                                ? 'You cannot edit environment'
                                : 'Edit environment'
                        }
                        arrow
                    >
                        <span id={editId}>
                            <IconButton
                                aria-describedby={editId}
                                disabled={environment.protected}
                                onClick={() => {
                                    navigate(
                                        `/environments/${environment.name}`
                                    );
                                }}
                                size="large"
                            >
                                <Edit />
                            </IconButton>
                        </span>
                    </Tooltip>
                }
            />
            <ConditionallyRender
                condition={hasAccess(DELETE_ENVIRONMENT)}
                show={
                    <Tooltip
                        title={
                            environment.protected
                                ? 'You cannot delete environment'
                                : 'Delete environment'
                        }
                        arrow
                    >
                        <span id={deleteId}>
                            <IconButton
                                aria-describedby={deleteId}
                                disabled={environment.protected}
                                onClick={() => setDeleteModal(true)}
                                size="large"
                            >
                                <Delete />
                            </IconButton>
                        </span>
                    </Tooltip>
                }
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
        </ActionCell>
    );
};
