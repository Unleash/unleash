import { PlaygroundResultStrategyLists } from './StrategyList/playgroundResultStrategyLists';
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
                    (feature?.strategies?.data?.length || 0) > 0
                }
                show={
                    <Alert severity="info" color="warning">
                        If environment was enabled, then this feature toggle
                        would be {feature.strategies?.result ? 'TRUE' : 'FALSE'}{' '}
                        with strategies evaluated like so:{' '}
                    </Alert>
                }
            />
            <PlaygroundResultStrategyLists
                strategies={feature?.strategies?.data || []}
                input={input}
            />
        </>
    );
};
