import type { DragEventHandler, FC, ReactNode } from 'react';
import Edit from '@mui/icons-material/Edit';
import { Link } from 'react-router-dom';
import type { IFeatureEnvironment } from 'interfaces/featureToggle';
import type { IFeatureStrategy } from 'interfaces/strategy';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { formatEditStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { StrategyExecution } from './StrategyExecution/StrategyExecution';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { CopyStrategyIconMenu } from './CopyStrategyIconMenu/CopyStrategyIconMenu';
import MenuStrategyRemove from './MenuStrategyRemove/MenuStrategyRemove';
import SplitPreviewSlider from 'component/feature/StrategyTypes/SplitPreviewSlider/SplitPreviewSlider';
import { Box } from '@mui/material';
import { StrategyItemContainer as NewStrategyItemContainer } from 'component/common/StrategyItemContainer/StrategyItemContainer';
interface IStrategyItemProps {
    environmentId: string;
    strategy: IFeatureStrategy;
    onDragStart?: DragEventHandler<HTMLButtonElement>;
    onDragEnd?: DragEventHandler<HTMLButtonElement>;
    otherEnvironments?: IFeatureEnvironment['name'][];
    orderNumber?: number;
    headerChildren?: JSX.Element[] | JSX.Element;
}

export const StrategyItem: FC<IStrategyItemProps> = ({
    environmentId,
    strategy,
    onDragStart,
    onDragEnd,
    otherEnvironments,
    orderNumber,
    headerChildren,
}) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');

    const editStrategyPath = formatEditStrategyPath(
        projectId,
        featureId,
        environmentId,
        strategy.id,
    );

    return (
        <NewStrategyItemContainer
            strategy={strategy}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            actions={
                <>
                    {headerChildren}
                    <ConditionallyRender
                        condition={Boolean(
                            otherEnvironments && otherEnvironments?.length > 0,
                        )}
                        show={() => (
                            <CopyStrategyIconMenu
                                environmentId={environmentId}
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
                        tooltipProps={{
                            title: 'Edit strategy',
                        }}
                        data-testid={`STRATEGY_EDIT-${strategy.name}`}
                    >
                        <Edit />
                    </PermissionIconButton>
                    <MenuStrategyRemove
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        strategy={strategy}
                    />
                </>
            }
        >
            <StrategyExecution strategy={strategy} />

            {strategy.variants &&
                strategy.variants.length > 0 &&
                (strategy.disabled ? (
                    <Box sx={{ opacity: '0.5' }}>
                        <SplitPreviewSlider variants={strategy.variants} />
                    </Box>
                ) : (
                    <SplitPreviewSlider variants={strategy.variants} />
                ))}
        </NewStrategyItemContainer>
    );
};

type Props = {
    actions: ReactNode;
    strategy: IFeatureStrategy;
    onDragStart?: DragEventHandler<HTMLButtonElement>;
    onDragEnd?: DragEventHandler<HTMLButtonElement>;
};

export const StrategyItemNoProject: FC<Props> = ({
    strategy,
    onDragStart,
    onDragEnd,
    actions,
}) => {
    return (
        <NewStrategyItemContainer
            strategy={strategy}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            actions={actions}
        >
            <StrategyExecution strategy={strategy} />

            {strategy.variants &&
                strategy.variants.length > 0 &&
                (strategy.disabled ? (
                    <Box sx={{ opacity: '0.5' }}>
                        <SplitPreviewSlider variants={strategy.variants} />
                    </Box>
                ) : (
                    <SplitPreviewSlider variants={strategy.variants} />
                ))}
        </NewStrategyItemContainer>
    );
};
