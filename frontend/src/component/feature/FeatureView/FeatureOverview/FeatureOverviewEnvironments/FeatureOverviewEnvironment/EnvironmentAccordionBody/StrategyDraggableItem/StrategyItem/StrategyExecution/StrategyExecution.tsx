import { Children, isValidElement, type FC, type ReactNode } from 'react';
import { styled } from '@mui/material';
import type { CreateFeatureStrategySchema } from 'openapi';
import type { IFeatureStrategyPayload } from 'interfaces/strategy';
import { useUiFlag } from 'hooks/useUiFlag';
import { StrategyExecution as LegacyStrategyExecution } from './LegacyStrategyExecution';
import { ConstraintItem } from './ConstraintItem/ConstraintItem';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { objectId } from 'utils/objectId';
import { StrategyExecutionSeparator } from './StrategyExecutionSeparator/StrategyExecutionSeparator';
import { useCustomStrategyParameters } from './hooks/useCustomStrategyItems';
import { useStrategyParameters } from './hooks/useStrategyParameters';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { SegmentItem } from 'component/common/SegmentItem/SegmentItem';

const StyledGrayscale = styled('div', {
    shouldForwardProp: (prop) => prop !== 'enabled',
})<{ enabled: boolean }>(({ enabled }) =>
    enabled ? { filter: 'grayscale(1)', opacity: 0.67 } : {},
);

const StyledList = styled('ul')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    padding: 0,
    margin: 0,
    '&.disabled-strategy': {
        filter: 'grayscale(1)',
        opacity: 0.67,
    },
    gap: theme.spacing(1),
}));

const StyledListItem = styled('li')(({ theme }) => ({
    position: 'relative',
    padding: theme.spacing(2, 3),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    background: theme.palette.background.default,
}));

const List: FC<{ children: ReactNode }> = ({ children }) => {
    const result: ReactNode[] = [];
    Children.forEach(children, (child, index) => {
        if (isValidElement(child)) {
            result.push(
                <ListItem key={index}>
                    {index > 0 ? (
                        <StrategyExecutionSeparator key={`${index}-divider`} />
                    ) : null}
                    {child}
                </ListItem>,
            );
        }
    });

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
    const { strategies } = useStrategies();
    const { segments } = useSegments();
    const { isCustomStrategy, customStrategyParameters: customStrategyItems } =
        useCustomStrategyParameters(strategy, strategies);
    const strategyParameters = useStrategyParameters(strategy, displayGroupId);
    const { constraints } = strategy;
    const strategySegments = segments?.filter((segment) =>
        strategy.segments?.includes(segment.id),
    );

    return (
        <StyledGrayscale enabled={strategy.disabled === true}>
            <List>
                {strategySegments?.map((segment) => (
                    <SegmentItem segment={segment} />
                ))}
                {constraints?.map((constraint, index) => (
                    <ConstraintItem
                        key={`${objectId(constraint)}-${index}`}
                        {...constraint}
                    />
                ))}
                {isCustomStrategy ? customStrategyItems : strategyParameters}
            </List>
        </StyledGrayscale>
    );
};

export const StrategyExecution: FC<StrategyExecutionProps> = ({ ...props }) => {
    const flagOverviewRedesign = useUiFlag('flagOverviewRedesign'); // && false;

    return flagOverviewRedesign ? (
        <NewStrategyExecution {...props} />
    ) : (
        <LegacyStrategyExecution {...props} />
    );
};
