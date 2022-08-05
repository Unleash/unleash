import { DragEventHandler } from 'react';
import { DragIndicator, Edit } from '@mui/icons-material';
import { styled, useTheme, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { IFeatureStrategy } from 'interfaces/strategy';
import {
    getFeatureStrategyIcon,
    formatStrategyName,
} from 'utils/strategyNames';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { formatEditStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { FeatureStrategyRemove } from 'component/feature/FeatureStrategy/FeatureStrategyRemove/FeatureStrategyRemove';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { StrategyExecution } from './StrategyExecution/StrategyExecution';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { CopyStrategyIconMenu } from './CopyStrategyIconMenu/CopyStrategyIconMenu';
import { useStyles } from './StrategyItem.styles';

interface IStrategyItemProps {
    environmentId: string;
    strategy: IFeatureStrategy;
    onDragStart?: DragEventHandler<HTMLButtonElement>;
    onDragEnd?: DragEventHandler<HTMLButtonElement>;
    otherEnvironments?: IFeatureEnvironment['name'][];
}

const DragIcon = styled(IconButton)(({ theme }) => ({
    padding: 0,
    cursor: 'inherit',
    transition: 'color 0.2s ease-in-out',
}));

export const StrategyItem = ({
    environmentId,
    strategy,
    onDragStart,
    onDragEnd,
    otherEnvironments,
}: IStrategyItemProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const theme = useTheme();
    const { classes: styles } = useStyles();
    const Icon = getFeatureStrategyIcon(strategy.name);

    const editStrategyPath = formatEditStrategyPath(
        projectId,
        featureId,
        environmentId,
        strategy.id
    );

    return (
        <div className={styles.container}>
            <div
                className={classNames(styles.header, {
                    [styles.headerDraggable]: Boolean(onDragStart),
                })}
            >
                <ConditionallyRender
                    condition={Boolean(onDragStart)}
                    show={() => (
                        <DragIcon
                            draggable
                            disableRipple
                            size="small"
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            sx={{ cursor: 'move' }}
                        >
                            <DragIndicator
                                titleAccess="Drag to reorder"
                                cursor="grab"
                                sx={{ color: 'neutral.main' }}
                            />
                        </DragIcon>
                    )}
                />
                <Icon className={styles.icon} />
                <StringTruncator
                    maxWidth="150"
                    maxLength={15}
                    text={formatStrategyName(strategy.name)}
                />
                <div className={styles.actions}>
                    <ConditionallyRender
                        condition={Boolean(
                            otherEnvironments && otherEnvironments?.length > 0
                        )}
                        show={() => (
                            <CopyStrategyIconMenu
                                environments={otherEnvironments as string[]}
                                strategy={strategy}
                            />
                        )}
                    />
                    <PermissionIconButton
                        permission={UPDATE_FEATURE_STRATEGY}
                        environmentId={environmentId}
                        projectId={projectId}
                        component={Link}
                        to={editStrategyPath}
                        tooltipProps={{ title: 'Edit strategy' }}
                    >
                        <Edit />
                    </PermissionIconButton>
                    <FeatureStrategyRemove
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        strategyId={strategy.id}
                        icon
                    />
                </div>
            </div>
            <div className={styles.body}>
                <StrategyExecution
                    strategy={strategy}
                    percentageFill={theme.palette.grey[200]}
                />
            </div>
        </div>
    );
};
