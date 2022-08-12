import {
    PlaygroundResultStrategyLists,
    WrappedPlaygroundResultStrategyList,
} from './StrategyList/playgroundResultStrategyLists';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    PlaygroundFeatureSchema,
    PlaygroundRequestSchema,
} from 'component/playground/Playground/interfaces/playground.model';
import { Alert } from '@mui/material';

interface PlaygroundResultFeatureStrategyListProps {
    feature: PlaygroundFeatureSchema;
    input?: PlaygroundRequestSchema;
}

export const PlaygroundResultFeatureStrategyList = ({
    feature,
    input,
}: PlaygroundResultFeatureStrategyListProps) => {
    return (
        <>
            <ConditionallyRender
                condition={feature?.strategies?.data?.length === 0}
                show={
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        There are no strategies added to this feature toggle in
                        selected environment.
                    </Alert>
                }
            />
            <ConditionallyRender
                condition={
                    !feature.isEnabledInCurrentEnvironment &&
                    Boolean(feature?.strategies?.data)
                }
                show={
                    <WrappedPlaygroundResultStrategyList
                        strategies={feature?.strategies}
                        input={input}
                    />
                }
                elseShow={
                    <PlaygroundResultStrategyLists
                        strategies={feature?.strategies?.data || []}
                        input={input}
                    />
                }
            />
        </>
    );
};
