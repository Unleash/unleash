import { ConditionallyRender } from '../../../../../common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from '../../../../../common/StrategySeparator/StrategySeparator';
import { StrategyItem } from '../../../../../feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyItem';
import {
    IConstraint,
    IFeatureStrategy, IPlaygroundFeatureStrategyResult,
} from '../../../../../../interfaces/strategy';
import { ISegment } from '../../../../../../interfaces/segment';


interface IPlaygroundResultFeatureStrategyItemProps {
    strategy: IPlaygroundFeatureStrategyResult;
    environmentName: string;
    index: number;
}

export const PlaygroundResultFeatureStrategyItem = ({
    strategy,
    environmentName,
    index,
}: IPlaygroundResultFeatureStrategyItemProps) => {
    const { result } = strategy;

    return (
        <div key={strategy.id} className={``}>
            <ConditionallyRender
                condition={index > 0}
                show={<StrategySeparator text="OR" />}
            />
            <StrategyItem
                strategy={strategy}
                result={result}
                environmentId={environmentName}
                isDraggable={false}
            />
        </div>
    );
};
