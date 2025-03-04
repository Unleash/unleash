import { type MouseEvent, useState, type VFC } from 'react';
import {
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
} from '@mui/material';
import CopyIcon from '@mui/icons-material/AddToPhotos';
import Lock from '@mui/icons-material/Lock';
import type { IFeatureStrategyPayload } from 'interfaces/strategy';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { IFeatureEnvironment } from 'interfaces/featureToggle';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import useToast from 'hooks/useToast';
import { useFeatureImmutable } from 'hooks/api/getters/useFeature/useFeatureImmutable';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useChangeRequestAddStrategy } from 'hooks/useChangeRequestAddStrategy';
import { ChangeRequestDialogue } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestConfirmDialog';
import { CopyStrategyMessage } from 'component/changeRequest/ChangeRequestConfirmDialog/ChangeRequestMessages/CopyStrategyMessage';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useCheckProjectAccess } from 'hooks/useHasAccess';
import { STRATEGY_FORM_COPY_ID } from 'utils/testIds';

interface ICopyStrategyIconMenuProps {
    environmentId: string;
    environments: IFeatureEnvironment['name'][];
    strategy: IFeatureStrategyPayload;
}

export const CopyStrategyIconMenu: VFC<ICopyStrategyIconMenuProps> = ({
    environmentId,
    environments,
    strategy,
}) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const { addStrategyToFeature } = useFeatureStrategyApi();
    const { setToastData, setToastApiError } = useToast();
    const { refetchFeature } = useFeature(projectId, featureId);
    const { refetchFeature: refetchFeatureImmutable } = useFeatureImmutable(
        projectId,
        featureId,
    );
    const onClose = () => {
        setAnchorEl(null);
    };
    const checkAccess = useCheckProjectAccess(projectId);
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

    const {
        changeRequestDialogDetails,
        onChangeRequestAddStrategyClose,
        onChangeRequestAddStrategy,
        onChangeRequestAddStrategyConfirm,
    } = useChangeRequestAddStrategy(projectId, featureId, 'addStrategy');

    const onCopyStrategy = async (targetEnvironment: string) => {
        const { id, ...strategyCopy } = {
            ...strategy,
            targetEnvironment,
        };
        if (isChangeRequestConfigured(targetEnvironment)) {
            await onChangeRequestAddStrategy(
                targetEnvironment,
                strategyCopy,
                environmentId,
            );
            return;
        }

        try {
            await addStrategyToFeature(
                projectId,
                featureId,
                targetEnvironment,
                strategy,
            );
            refetchFeature();
            refetchFeatureImmutable();
            setToastData({
                text: `Strategy copied to ${targetEnvironment}`,
                type: 'success',
            });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
        onClose();
    };

    const enabled = [...environments, environmentId].some((environment) =>
        checkAccess(CREATE_FEATURE_STRATEGY, environment),
    );

    const label = `Copy to environment${enabled ? '' : ` (Access denied, missing ${CREATE_FEATURE_STRATEGY} permission)`}`;

    return (
        <div>
            <ChangeRequestDialogue
                isOpen={changeRequestDialogDetails.isOpen}
                onClose={onChangeRequestAddStrategyClose}
                environment={changeRequestDialogDetails?.environment}
                onConfirm={onChangeRequestAddStrategyConfirm}
                messageComponent={
                    <CopyStrategyMessage
                        fromEnvironment={
                            changeRequestDialogDetails.fromEnvironment!
                        }
                        payload={changeRequestDialogDetails.strategy!}
                    />
                }
            />
            <Tooltip title={label}>
                <div>
                    <IconButton
                        size='large'
                        id={`copy-strategy-icon-menu-${strategy.id}`}
                        aria-label={label}
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup='true'
                        aria-expanded={open ? 'true' : undefined}
                        onClick={(event: MouseEvent<HTMLButtonElement>) => {
                            setAnchorEl(event.currentTarget);
                        }}
                        data-testid={STRATEGY_FORM_COPY_ID}
                        disabled={!enabled}
                    >
                        <CopyIcon />
                    </IconButton>
                </div>
            </Tooltip>
            <Menu
                id='basic-menu'
                anchorEl={anchorEl}
                open={open}
                onClose={onClose}
                MenuListProps={{
                    'aria-labelledby': `copy-strategy-icon-menu-${strategy.id}`,
                }}
            >
                {[...environments, environmentId].map((environment) => {
                    const access = checkAccess(
                        CREATE_FEATURE_STRATEGY,
                        environment,
                    );

                    return (
                        <Tooltip
                            title={
                                access
                                    ? ''
                                    : "You don't have access to add a strategy to this environment"
                            }
                            key={environment}
                        >
                            <div>
                                <MenuItem
                                    onClick={() => onCopyStrategy(environment)}
                                    disabled={!access}
                                >
                                    <ConditionallyRender
                                        condition={!access}
                                        show={
                                            <ListItemIcon>
                                                <Lock fontSize='small' />
                                            </ListItemIcon>
                                        }
                                    />
                                    <ListItemText>
                                        {environment === environmentId
                                            ? 'Duplicate in current'
                                            : `Copy to ${environment}`}
                                    </ListItemText>
                                </MenuItem>
                            </div>
                        </Tooltip>
                    );
                })}
            </Menu>
        </div>
    );
};
