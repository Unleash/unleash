import { PlaygroundResultStrategyLists } from './PlaygroundResultStrategyList/playgroundResultStrategyLists';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    PlaygroundFeatureSchema,
    PlaygroundRequestSchema,
} from 'hooks/api/actions/usePlayground/playground.model';
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
                condition={
                    !feature.isEnabledInCurrentEnvironment &&
                    Boolean(feature?.strategies?.data)
                }
                show={
                    <Alert severity={'info'} color={'info'}>
                        If environment would be enabled then this feature would
                        be {feature.strategies?.result ? 'TRUE' : 'FALSE'} and
                        the strategies would evaluate like this:{' '}
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
