import { Alert, styled } from '@mui/material';
import type {
    PlaygroundStrategySchema,
    PlaygroundRequestSchema,
} from 'openapi';
import {
    StyledContentList,
    StyledListItem,
} from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/EnvironmentAccordionBody';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { FeatureStrategyItem } from './StrategyItem/FeatureStrategyItem';

const StyledAlertWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    padding: `0, 4px`,
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.warning.border}`,
}));

const StyledListWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(1, 0.5),
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    border: '0!important',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottom: `1px solid ${theme.palette.warning.border}!important`,
}));

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
                        {index > 0 ? <StrategySeparator /> : ''}
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
