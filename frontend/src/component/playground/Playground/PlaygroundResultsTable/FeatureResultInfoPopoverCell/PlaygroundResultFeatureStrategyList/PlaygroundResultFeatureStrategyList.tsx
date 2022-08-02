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
            condition={!feature.isEnabledInCurrentEnvironment}
            show={
                <PlaygroundResultStrategyLists
                    strategies={feature?.strategies}
                    input={input}
                />
            }
            elseShow={
                <WrappedPlaygroundResultStrategyList
                    strategies={feature?.strategies}
                    feature={feature}
                    input={input}
                />
            }
        />
    );
};
