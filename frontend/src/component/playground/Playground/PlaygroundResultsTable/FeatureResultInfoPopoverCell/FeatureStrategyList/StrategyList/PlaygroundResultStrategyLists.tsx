import { styled } from '@mui/material';
import type {
    PlaygroundStrategySchema,
    PlaygroundRequestSchema,
} from 'openapi';
import {
    StyledContentList,
    StyledListItem,
    StyledStrategySeparator,
} from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/EnvironmentAccordionBody';
import { FeatureStrategyItem } from './StrategyItem/FeatureStrategyItem';

interface PlaygroundResultStrategyListProps {
    strategies: PlaygroundStrategySchema[];
    input?: PlaygroundRequestSchema;
    titlePrefix?: 'Enabled' | 'Disabled';
    infoText?: string;
}
const StyledHeaderGroup = styled('hgroup')(({ theme }) => ({
    paddingBottom: theme.spacing(2),
}));

const StyledListTitle = styled('h4')(({ theme }) => ({
    fontWeight: 'normal',
    fontSize: theme.typography.body1.fontSize,
    margin: 0,
}));

const StyledListTitleDescription = styled('p')(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: theme.typography.body2.fontSize,
}));

const RestyledContentList = styled(StyledContentList)(({ theme }) => ({
    marginInline: `calc(var(--popover-inline-padding) * -1)`,
    borderTop: `1px solid ${theme.palette.divider}`,
    '> li:last-of-type': {
        paddingBottom: 0,
    },
}));

export const PlaygroundResultStrategyLists = ({
    strategies,
    input,
    titlePrefix,
    infoText,
}: PlaygroundResultStrategyListProps) => {
    if (strategies.length === 0) {
        return null;
    }

    return (
        <div>
            <StyledHeaderGroup>
                <StyledListTitle>{`${
                    titlePrefix
                        ? titlePrefix.concat(' strategies')
                        : 'Strategies'
                } (${strategies?.length})`}</StyledListTitle>
                {infoText ? (
                    <StyledListTitleDescription>
                        {infoText}
                    </StyledListTitleDescription>
                ) : null}
            </StyledHeaderGroup>
            <RestyledContentList>
                {strategies?.map((strategy, index) => (
                    <StyledListItem key={strategy.id}>
                        {index > 0 ? <StyledStrategySeparator /> : ''}
                        <FeatureStrategyItem
                            strategy={strategy}
                            input={input}
                        />
                    </StyledListItem>
                ))}
            </RestyledContentList>
        </div>
    );
};
