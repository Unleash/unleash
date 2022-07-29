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
import { IFeatureStrategy } from 'interfaces/strategy';
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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const { addStrategyToFeature } = useFeatureStrategyApi();
    const { setToastData, setToastApiError } = useToast();
    const { refetchFeature } = useFeature(projectId, featureId);
    const { refetchFeature: refetchFeatureImmutable } = useFeatureImmutable(
        projectId,
        featureId
    );
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const { hasAccess } = useContext(AccessContext);
    const onClick = async (environmentId: string) => {
        const { id, ...strategyCopy } = {
            ...strategy,
            environment: environmentId,
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
        handleClose();
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
                        id="basic-button"
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
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
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
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
                                    <ListItemText>{environment}</ListItemText>
                                </MenuItem>
                            </div>
                        </Tooltip>
                    );
                })}
            </Menu>
        </div>
    );
};
