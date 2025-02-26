import { Children, type FC, type ReactNode } from 'react';
import { styled } from '@mui/material';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import type { CreateFeatureStrategySchema } from 'openapi';
import type { IFeatureStrategyPayload } from 'interfaces/strategy';
import { useUiFlag } from 'hooks/useUiFlag';
import { StrategyExecution as LegacyStrategyExecution } from './LegacyStrategyExecution';
import { StrategyExecutionItem } from './StrategyExecutionItem/StrategyExecutionItem';
import { ConstraintItem } from './ConstraintItem/ConstraintItem';

const StyledGrayscale = styled('div', {
    shouldForwardProp: (prop) => prop !== 'enabled',
})<{ enabled: boolean }>(({ enabled }) =>
    enabled
        ? {
              filter: 'grayscale(1)',
              opacity: 0.67,
          }
        : {},
);

const StyledList = styled('ul')({
    listStyle: 'none',
    padding: 0,
    margin: 0,
    '&.disabled-strategy': {
        filter: 'grayscale(1)',
        opacity: 0.67,
    },
});

const StyledListItem = styled('li')(({ theme }) => ({
    padding: theme.spacing(2, 3),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    background: theme.palette.background.default,
}));

const List: FC<{ children: ReactNode }> = ({ children }) => {
    const result: ReactNode[] = [];
    Children.forEach(children, (child, index) => {
        if (child) {
            result.push(child);
            result.push(<StrategySeparator key={index} text='AND' />);
        }
    });
    result.pop(); // Remove the last separator
    return <StyledList>{result}</StyledList>;
};

const ListItem: FC<{ children: ReactNode }> = ({ children }) => (
    <StyledListItem>{children}</StyledListItem>
);

type StrategyExecutionProps = {
    strategy: IFeatureStrategyPayload | CreateFeatureStrategySchema;
    displayGroupId?: boolean;
};

const NewStrategyExecution: FC<StrategyExecutionProps> = ({
    strategy,
    displayGroupId = false,
}) => {
    const { constraints } = strategy;

    return (
        <StyledGrayscale enabled={strategy.disabled === true}>
            <List>
                {constraints?.map((constraint) => (
                    <ListItem>
                        <ConstraintItem {...constraint} />
                    </ListItem>
                ))}
                <ListItem>
                    <StrategyExecutionItem type='Rollout %'>
                        seg
                    </StrategyExecutionItem>
                </ListItem>
            </List>
        </StyledGrayscale>
    );
};

export const StrategyExecution: FC<StrategyExecutionProps> = ({ ...props }) => {
    const flagOverviewRedesign = useUiFlag('flagOverviewRedesign');

    return flagOverviewRedesign ? (
        <NewStrategyExecution {...props} />
    ) : (
        <LegacyStrategyExecution {...props} />
    );
};
