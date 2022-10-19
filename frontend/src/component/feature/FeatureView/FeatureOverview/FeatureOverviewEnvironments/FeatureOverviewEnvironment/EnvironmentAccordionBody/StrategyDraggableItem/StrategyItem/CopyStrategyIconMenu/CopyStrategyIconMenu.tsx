import { MouseEvent, useContext, useState, VFC } from 'react';
import {
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
} from '@mui/material';
import { AddToPhotos as CopyIcon, Lock } from '@mui/icons-material';
import { IFeatureStrategy, IFeatureStrategyPayload } from 'interfaces/strategy';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import AccessContext from 'contexts/AccessContext';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import useToast from 'hooks/useToast';
import { useFeatureImmutable } from 'hooks/api/getters/useFeature/useFeatureImmutable';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useSegments } from '../../../../../../../../../../hooks/api/getters/useSegments/useSegments';

interface ICopyStrategyIconMenuProps {
    environments: IFeatureEnvironment['name'][];
    strategy: IFeatureStrategy;
}

export const CopyStrategyIconMenu: VFC<ICopyStrategyIconMenuProps> = ({
    environments,
    strategy,
}) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { segments } = useSegments(strategy.id);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const { addStrategyToFeature } = useFeatureStrategyApi();
    const { setToastData, setToastApiError } = useToast();
    const { refetchFeature } = useFeature(projectId, featureId);
    const { refetchFeature: refetchFeatureImmutable } = useFeatureImmutable(
        projectId,
        featureId
    );
    const onClose = () => {
        setAnchorEl(null);
    };
    const { hasAccess } = useContext(AccessContext);
    const onClick = async (environmentId: string) => {
        const { id, ...strategyCopy } = {
            ...strategy,
            environment: environmentId,
            copyOf: strategy.id,
        };

        try {
            await addStrategyToFeature(
                projectId,
                featureId,
                environmentId,
                strategyCopy
            );
            refetchFeature();
            refetchFeatureImmutable();
            setToastData({
                title: `Strategy created`,
                text: `Successfully copied a strategy to ${environmentId}`,
                type: 'success',
            });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
        onClose();
    };

    const enabled = environments.some(environment =>
        hasAccess(CREATE_FEATURE_STRATEGY, projectId, environment)
    );

    return (
        <div>
            <Tooltip
                title={`Copy to another environment${
                    enabled ? '' : ' (Access denied)'
                }`}
            >
                <div>
                    <IconButton
                        size="large"
                        id={`copy-strategy-icon-menu-${strategy.id}`}
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={(event: MouseEvent<HTMLButtonElement>) => {
                            setAnchorEl(event.currentTarget);
                        }}
                        disabled={!enabled}
                    >
                        <CopyIcon />
                    </IconButton>
                </div>
            </Tooltip>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={onClose}
                MenuListProps={{
                    'aria-labelledby': `copy-strategy-icon-menu-${strategy.id}`,
                }}
            >
                {environments.map(environment => {
                    const access = hasAccess(
                        CREATE_FEATURE_STRATEGY,
                        projectId,
                        environment
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
                                    onClick={() => onClick(environment)}
                                    disabled={!access}
                                >
                                    <ConditionallyRender
                                        condition={!access}
                                        show={
                                            <ListItemIcon>
                                                <Lock fontSize="small" />
                                            </ListItemIcon>
                                        }
                                    />
                                    <ListItemText>
                                        Copy to {environment}
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
