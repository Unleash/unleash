import { styled } from '@mui/material';
import type {
    PlaygroundStrategySchema,
    PlaygroundRequestSchema,
} from 'openapi';

import { FeatureStrategyItem } from './StrategyItem/FeatureStrategyItem.tsx';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { StrategyList } from 'component/common/StrategyList/StrategyList';
import { StrategyListItem } from 'component/common/StrategyList/StrategyListItem';

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

const StyledStrategyList = styled(StrategyList)(({ theme }) => ({
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
            <StyledStrategyList>
                {strategies?.map((strategy, index) => (
                    <StrategyListItem key={strategy.id}>
                        {index > 0 ? <StrategySeparator /> : ''}
                        <FeatureStrategyItem
                            strategy={strategy}
                            input={input}
                        />
                    </StrategyListItem>
                ))}
            </StyledStrategyList>
        </div>
    );
};
