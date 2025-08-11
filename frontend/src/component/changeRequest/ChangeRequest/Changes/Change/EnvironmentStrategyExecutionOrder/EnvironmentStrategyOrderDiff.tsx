import { EventDiff } from 'component/events/EventDiff/EventDiff';
import { Fragment } from 'react';
type StrategyIds = { strategyIds: string[] };
interface IDiffProps {
    preData: StrategyIds;
    data: StrategyIds;
}

export const EnvironmentStrategyOrderDiff = ({ preData, data }: IDiffProps) => {
    return (
        <Fragment>
            <EventDiff
                entry={{
                    preData: preData.strategyIds,
                    data: data.strategyIds,
                }}
            />
        </Fragment>
    );
};
