import { EventDiff } from 'component/events/EventDiff/EventDiff';
type StrategyIds = { strategyIds: string[] };
interface IDiffProps {
    preData: StrategyIds;
    data: StrategyIds;
}

export const EnvironmentStrategyOrderDiff = ({ preData, data }: IDiffProps) => {
    return (
        <EventDiff
            entry={{
                preData: preData.strategyIds,
                data: data.strategyIds,
            }}
        />
    );
};
