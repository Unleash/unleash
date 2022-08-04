import {
    PlaygroundResultStrategyLists,
    WrappedPlaygroundResultStrategyList,
} from './PlaygroundResultStrategyList/playgroundResultStrategyLists';
import { ConditionallyRender } from '../../../../../common/ConditionallyRender/ConditionallyRender';
import React from 'react';
import {
    PlaygroundFeatureSchema,
    PlaygroundRequestSchema,
} from '../../../../../../hooks/api/actions/usePlayground/playground.model';

interface PlaygroundResultFeatureStrategyListProps {
    feature: PlaygroundFeatureSchema;
    input?: PlaygroundRequestSchema;
}

export const PlaygroundResultFeatureStrategyList = ({
    feature,
    input,
}: PlaygroundResultFeatureStrategyListProps) => {
    return (
        <ConditionallyRender
            condition={!feature.isEnabledInCurrentEnvironment && Boolean(feature?.strategies?.data)}
            show={
                <WrappedPlaygroundResultStrategyList
                    strategies={feature?.strategies?.data!}
                    feature={feature}
                    input={input}
                />
            }
            elseShow={
                <PlaygroundResultStrategyLists
                    strategies={feature?.strategies?.data!}
                    input={input}
                />
            }
        />
    );
};
