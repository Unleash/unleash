import {
    Children,
    isValidElement,
    useMemo,
    type FC,
    type ReactNode,
} from 'react';
import { styled } from '@mui/material';
import type {
    CreateFeatureStrategySchema,
    StrategySchema,
    StrategySchemaParametersItem,
} from 'openapi';
import type { IFeatureStrategyPayload } from 'interfaces/strategy';
import { useUiFlag } from 'hooks/useUiFlag';
import { StrategyExecution as LegacyStrategyExecution } from './LegacyStrategyExecution';
import { StrategyExecutionItem } from './StrategyExecutionItem/StrategyExecutionItem';
import { ConstraintItem } from './ConstraintItem/ConstraintItem';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { objectId } from 'utils/objectId';
import { StrategyChip } from './StrategyChip/StrategyChip';
import {
    parseParameterNumber,
    parseParameterString,
    parseParameterStrings,
} from 'utils/parseParameter';
import { StrategyExecutionSeparator } from './StrategyExecutionSeparator/StrategyExecutionSeparator';
import { Truncator } from 'component/common/Truncator/Truncator';

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

const RolloutParameter: FC<{
    value?: string | number;
    parameters?: (
        | IFeatureStrategyPayload
        | CreateFeatureStrategySchema
    )['parameters'];
    hasConstraints?: boolean;
    displayGroupId?: boolean;
}> = ({ value, parameters, hasConstraints, displayGroupId }) => {
    const percentage = parseParameterNumber(value);

    const explainStickiness =
        typeof parameters?.stickiness === 'string' &&
        parameters?.stickiness !== 'default';
    const stickiness = explainStickiness ? (
        <>
            with <strong>{parameters.stickiness}</strong>
        </>
    ) : (
        ''
    );

    return (
        <StrategyExecutionItem type='Rollout %'>
            <StrategyChip label={`${percentage}%`} /> of your base {stickiness}
            <span>
                {hasConstraints ? 'who match constraints ' : ' '}
                is included.
            </span>
            {/* TODO: displayGroupId */}
        </StrategyExecutionItem>
    );
};

const useStrategyParameters = (
    strategy: IFeatureStrategyPayload | CreateFeatureStrategySchema,
    displayGroupId?: boolean,
) => {
    const { constraints } = strategy;
    const { parameters } = strategy;
    const hasConstraints = Boolean(constraints?.length);
    const parameterKeys = parameters ? Object.keys(parameters) : [];
    const mapPredefinedStrategies = (key: string) => {
        if (key === 'rollout' || key === 'Rollout') {
            return (
                <RolloutParameter
                    key={key}
                    value={parameters?.[key]}
                    parameters={parameters}
                    hasConstraints={hasConstraints}
                    displayGroupId={displayGroupId}
                />
            );
        }

        if (
            ['userIds', 'UserIds', 'hostNames', 'HostNames', 'IPs'].includes(
                key,
            )
        ) {
            return (
                <StrategyExecutionItem
                    key={key}
                    type={key}
                    values={parseParameterStrings(parameters?.[key])}
                />
            );
        }

        return null;
    };

    return useMemo(
        () => parameterKeys.map(mapPredefinedStrategies).filter(Boolean),
        [parameters, hasConstraints, displayGroupId],
    );
};

const useCustomStrategyItems = (
    strategy: IFeatureStrategyPayload | CreateFeatureStrategySchema,
    strategies: StrategySchema[],
) => {
    const { parameters } = strategy;
    const definition = useMemo(
        () =>
            strategies.find((strategyDefinition) => {
                return strategyDefinition.name === strategy.name;
            }),
        [strategies, strategy.name],
    );
    const isCustomStrategy = definition?.editable;

    const mapCustomStrategies = (
        param: StrategySchemaParametersItem,
        index: number,
    ) => {
        if (!parameters || !param.name) return null;
        const { type, name } = param;
        const typeItem = <Truncator title={name}>{name}</Truncator>;
        const key = `${type}${index}`;

        switch (type) {
            case 'list': {
                const values = parseParameterStrings(parameters[name]);
                if (!values || values.length === 0) {
                    return null;
                }

                return (
                    <StrategyExecutionItem
                        key={key}
                        type={typeItem}
                        values={values}
                    >
                        {values.length === 1
                            ? 'has 1 item:'
                            : `has ${values.length} items:`}
                    </StrategyExecutionItem>
                );
            }

            case 'percentage': {
                const value = parseParameterNumber(parameters[name]);
                return (
                    <StrategyExecutionItem key={key} type={typeItem}>
                        is set to <StrategyChip label={`${value}%`} />
                    </StrategyExecutionItem>
                );
            }

            case 'boolean': {
                const value = parameters[name];
                return (
                    <StrategyExecutionItem key={key} type={typeItem}>
                        is set to <StrategyChip label={value} />
                    </StrategyExecutionItem>
                );
            }

            case 'string': {
                const value = parseParameterString(parameters[name]);

                return (
                    <StrategyExecutionItem
                        key={key}
                        type={typeItem}
                        values={value === '' ? undefined : [value]}
                    >
                        {value === '' ? 'is an empty string' : 'is set to'}
                    </StrategyExecutionItem>
                );
            }

            case 'number': {
                const value = parseParameterNumber(parameters[name]);
                return (
                    <StrategyExecutionItem
                        key={key}
                        type={typeItem}
                        values={[`${value}`]}
                    >
                        is a number set to
                    </StrategyExecutionItem>
                );
            }

            case 'default':
                return null;
        }

        return null;
    };

    return useMemo(
        () => ({
            isCustomStrategy,
            customStrategyItems: definition?.parameters
                ?.map(mapCustomStrategies)
                .filter(Boolean),
        }),
        [definition, isCustomStrategy, parameters],
    );
};

type StrategyExecutionProps = {
    strategy: IFeatureStrategyPayload | CreateFeatureStrategySchema;
    displayGroupId?: boolean;
};

const NewStrategyExecution: FC<StrategyExecutionProps> = ({
    strategy,
    displayGroupId = false,
}) => {
    const { strategies } = useStrategies();
    const { isCustomStrategy, customStrategyItems } = useCustomStrategyItems(
        strategy,
        strategies,
    );
    const strategyParameters = useStrategyParameters(strategy, displayGroupId);
    const { constraints } = strategy;

    return (
        <StyledGrayscale enabled={strategy.disabled === true}>
            <List>
                {/* TODO: segments */}
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
