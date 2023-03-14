import {
    IChangeRequestAddStrategy,
    IChangeRequestDeleteStrategy,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { FC } from 'react';
import {
    formatStrategyName,
    GetFeatureStrategyIcon,
} from 'utils/strategyNames';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import EventDiff from 'component/events/EventDiff/EventDiff';
import omit from 'lodash.omit';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { styled } from '@mui/material';

const StyledCodeSection = styled('div')(({ theme }) => ({
    overflowX: 'auto',
    '& code': {
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        lineHeight: 1.5,
        fontSize: theme.fontSizes.smallBody,
    },
}));

const useCurrentStrategy = (
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy,
    project: string,
    feature: string,
    environmentName: string
) => {
    const currentFeature = useFeature(project, feature);
    const currentStrategy = currentFeature.feature?.environments
        .find(environment => environment.name === environmentName)
        ?.strategies.find(
            strategy =>
                'id' in change.payload && strategy.id === change.payload.id
        );
    return currentStrategy;
};

export const StrategyDiff: FC<{
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy;
    project: string;
    feature: string;
    environmentName: string;
}> = ({ change, project, feature, environmentName }) => {
    const currentStrategy = useCurrentStrategy(
        change,
        project,
        feature,
        environmentName
    );

    const changeRequestStrategy =
        change.action === 'deleteStrategy' ? undefined : change.payload;

    return (
        <StyledCodeSection>
            <EventDiff
                entry={{
                    preData: omit(currentStrategy, 'sortOrder'),
                    data: changeRequestStrategy,
                }}
            />
        </StyledCodeSection>
    );
};
interface IStrategyTooltipLinkProps {
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy;
}

export const StrategyTooltipLink: FC<IStrategyTooltipLinkProps> = ({
    change,
    children,
}) => (
    <>
        <GetFeatureStrategyIcon strategyName={change.payload.name} />
        <TooltipLink tooltip={children}>
            {formatStrategyName(change.payload.name)}
        </TooltipLink>
    </>
);
