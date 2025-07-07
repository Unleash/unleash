import type { DragEventHandler, FC, ReactNode } from 'react';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { StrategyExecution } from './StrategyExecution/StrategyExecution.tsx';
import { StrategyItemContainer } from 'component/common/StrategyItemContainer/StrategyItemContainer';

type StrategyItemProps = {
    headerItemsRight?: ReactNode;
    strategy: Omit<IFeatureStrategy, 'id'>;
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
    return (
        <StrategyItemContainer
            strategyHeaderLevel={strategyHeaderLevel}
            strategy={strategy}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            headerItemsRight={headerItemsRight}
        >
            <StrategyExecution strategy={strategy} />
        </StrategyItemContainer>
    );
};
