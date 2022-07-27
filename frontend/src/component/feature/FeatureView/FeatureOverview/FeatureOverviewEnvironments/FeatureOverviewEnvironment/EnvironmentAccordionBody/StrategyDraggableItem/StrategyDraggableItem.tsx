import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { MoveListItem, useDragItem } from 'hooks/useDragItem';
import { IFeatureStrategy } from 'interfaces/strategy';
import { StrategyItem } from './StrategyItem/StrategyItem';

interface IStrategyDraggableItemProps {
    strategy: IFeatureStrategy;
    environmentName: string;
    index: number;
    onDragAndDrop: MoveListItem;
}

export const StrategyDraggableItem = ({
    strategy,
    index,
    environmentName,
    onDragAndDrop,
}: IStrategyDraggableItemProps) => {
    const ref = useDragItem(index, onDragAndDrop);

    return (
        <div key={strategy.id} ref={ref}>
            <ConditionallyRender
                condition={index > 0}
                show={<StrategySeparator text="OR" />}
            />
            <StrategyItem
                strategy={strategy}
                environmentId={environmentName}
                isDraggable
            />
        </div>
    );
};
