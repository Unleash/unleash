import { DragIndicator, Edit } from '@mui/icons-material';
import { styled, useTheme, IconButton, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import {IFeatureStrategy, IPlaygroundFeatureStrategyResult} from 'interfaces/strategy';
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
import { useStyles } from './StrategyItem.styles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IStrategyItemProps {
    environmentId: string;
    strategy: IFeatureStrategy | IPlaygroundFeatureStrategyResult;
    isDraggable?: boolean;
    showActions?: boolean;
    result?: boolean;
}

const DragIcon = styled(IconButton)(({ theme }) => ({
    padding: 0,
    cursor: 'inherit',
    transition: 'color 0.2s ease-in-out',
}));

export const StrategyItem = ({
    environmentId,
    strategy,
    isDraggable,
    showActions = true,
    result,
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

    const showShouldShowResultChip = result !== undefined;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <ConditionallyRender
                    condition={Boolean(isDraggable)}
                    show={() => (
                        <DragIcon disableRipple disabled size="small">
                            <DragIndicator
                                titleAccess="Drag to reorder"
                                cursor="grab"
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
                <ConditionallyRender
                    condition={showActions}
                    show={
                        <div className={styles.actions}>
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
                    }
                />
                <ConditionallyRender
                    condition={showShouldShowResultChip}
                    show={
                        <Featur>
                    }
                />
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
