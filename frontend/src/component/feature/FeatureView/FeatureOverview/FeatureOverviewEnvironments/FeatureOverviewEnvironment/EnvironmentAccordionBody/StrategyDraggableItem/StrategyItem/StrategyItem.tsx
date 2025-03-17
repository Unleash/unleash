import type { DragEventHandler, FC, ReactNode } from 'react';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { StrategyExecution } from './StrategyExecution/StrategyExecution';
import { StrategyItemContainer } from 'component/common/StrategyItemContainer/StrategyItemContainer';
import { useIsCollapsed } from './CollapseStrategyIcon';

type StrategyItemProps = {
    headerItemsRight?: ReactNode;
    strategy: IFeatureStrategy;
    onDragStart?: DragEventHandler<HTMLButtonElement>;
    onDragEnd?: DragEventHandler<HTMLButtonElement>;
    strategyHeaderLevel?: 1 | 2 | 3 | 4 | 5 | 6;
};

export const StrategyItem: FC<StrategyItemProps> = ({
    strategy,
    onDragStart,
    onDragEnd,
    headerItemsRight,
    strategyHeaderLevel,
}) => {
    const isCollapsed = useIsCollapsed(strategy.id);

    return (
        <StrategyItemContainer
            strategyHeaderLevel={strategyHeaderLevel}
            strategy={strategy}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            headerItemsRight={headerItemsRight}
            isCollapsed={isCollapsed}
        >
            {!isCollapsed && <StrategyExecution strategy={strategy} />}
        </StrategyItemContainer>
    );
};
