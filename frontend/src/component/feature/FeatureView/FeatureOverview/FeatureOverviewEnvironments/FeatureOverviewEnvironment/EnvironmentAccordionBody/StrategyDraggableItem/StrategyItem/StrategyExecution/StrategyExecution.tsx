import { Fragment, useMemo, type VFC } from 'react';
import { Alert, Box, Chip, Link, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { ConstraintItem } from './ConstraintItem/ConstraintItem';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { FeatureOverviewSegment } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewSegment/FeatureOverviewSegment';
import { ConstraintAccordionList } from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';
import {
    parseParameterNumber,
    parseParameterString,
    parseParameterStrings,
} from 'utils/parseParameter';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { Badge } from 'component/common/Badge/Badge';
import type { CreateFeatureStrategySchema } from 'openapi';
import type { IFeatureStrategyPayload } from 'interfaces/strategy';
import { BuiltInStrategies } from 'utils/strategyNames';

interface IStrategyExecutionProps {
    strategy: IFeatureStrategyPayload | CreateFeatureStrategySchema;
}

const StyledContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled?: boolean | null }>(({ theme, disabled }) => ({
    '& p, & span, & h1, & h2, & h3, & h4, & h5, & h6': {
        color: disabled ? theme.palette.neutral.main : 'inherit',
    },
    '.constraint-icon-container': {
        backgroundColor: disabled
            ? theme.palette.neutral.border
            : theme.palette.primary.light,
        borderRadius: '50%',
    },
    '.constraint-icon': {
        fill: disabled
            ? theme.palette.neutral.light
            : theme.palette.common.white,
    },
}));

const CustomStrategyDeprecationWarning = () => (
    <Alert severity='warning' sx={{ mb: 2 }}>
        Custom strategies are deprecated and may be removed in a future major
        version. Consider rewriting this strategy as a predefined strategy with{' '}
        <Link
            href={'https://docs.getunleash.io/reference/strategy-constraints'}
            target='_blank'
            variant='body2'
        >
            constraints.
        </Link>
    </Alert>
);

const NoItems: VFC = () => (
    <Box sx={{ px: 3, color: 'text.disabled' }}>
        This strategy does not have constraints or parameters.
    </Box>
);

const StyledValueContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 3),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    background: theme.palette.background.default,
}));

const StyledValueSeparator = styled('span')(({ theme }) => ({
    color: theme.palette.neutral.main,
}));

export const StrategyExecution: VFC<IStrategyExecutionProps> = ({
    strategy,
}) => {
    const { parameters, constraints = [] } = strategy;
    const stickiness = parameters?.stickiness;
    const explainStickiness =
        typeof stickiness === 'string' && stickiness !== 'default';
    const { strategies } = useStrategies();
    const { segments } = useSegments();
    const strategySegments = segments?.filter((segment) => {
        return strategy.segments?.includes(segment.id);
    });

    const definition = strategies.find((strategyDefinition) => {
        return strategyDefinition.name === strategy.name;
    });

    const parametersList = useMemo(() => {
        if (!parameters || definition?.editable) return null;

        return Object.keys(parameters).map((key) => {
            switch (key) {
                case 'rollout':
                case 'Rollout': {
                    const percentage = parseParameterNumber(parameters[key]);

                    const badgeType = strategy.disabled ? 'neutral' : 'success';

                    return (
                        <StyledValueContainer
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Box sx={{ mr: 2 }}>
                                <PercentageCircle
                                    percentage={percentage}
                                    size='2rem'
                                    disabled={strategy.disabled}
                                />
                            </Box>
                            <div>
                                <Badge color={badgeType}>{percentage}%</Badge>{' '}
                                <span>of your base</span>{' '}
                                <span>
                                    {explainStickiness ? (
                                        <>
                                            with <strong>{stickiness}</strong>
                                        </>
                                    ) : (
                                        ''
                                    )}{' '}
                                </span>
                                <span>
                                    {constraints.length > 0
                                        ? 'who match constraints'
                                        : ''}{' '}
                                    is included.
                                </span>
                            </div>
                        </StyledValueContainer>
                    );
                }
                case 'userIds':
                case 'UserIds': {
                    const users = parseParameterStrings(parameters[key]);
                    return (
                        <ConstraintItem key={key} value={users} text='user' />
                    );
                }
                case 'hostNames':
                case 'HostNames': {
                    const hosts = parseParameterStrings(parameters[key]);
                    return (
                        <ConstraintItem key={key} value={hosts} text={'host'} />
                    );
                }
                case 'IPs': {
                    const IPs = parseParameterStrings(parameters[key]);
                    return <ConstraintItem key={key} value={IPs} text={'IP'} />;
                }
                case 'stickiness':
                case 'groupId':
                    return null;
                default:
                    return null;
            }
        });
    }, [parameters, definition, constraints, strategy.disabled]);

    const customStrategyList = useMemo(() => {
        if (!parameters || !definition?.editable) return null;
        const isSetTo = (
            <StyledValueSeparator>{' is set to '}</StyledValueSeparator>
        );

        return definition?.parameters.map((param) => {
            const { type, name } = { ...param };
            if (!type || !name || parameters[name] === undefined) {
                return null;
            }
            const nameItem = (
                <StringTruncator maxLength={15} maxWidth='150' text={name} />
            );

            switch (param?.type) {
                case 'list': {
                    const values = parseParameterStrings(parameters[name]);

                    return values.length > 0 ? (
                        <StyledValueContainer>
                            {nameItem}{' '}
                            <StyledValueSeparator>
                                has {values.length}{' '}
                                {values.length > 1 ? `items` : 'item'}:{' '}
                                {values.map((item: string) => (
                                    <Chip
                                        key={item}
                                        label={
                                            <StringTruncator
                                                maxWidth='300'
                                                text={item}
                                                maxLength={50}
                                            />
                                        }
                                        sx={{ mr: 0.5 }}
                                    />
                                ))}
                            </StyledValueSeparator>
                        </StyledValueContainer>
                    ) : null;
                }

                case 'percentage': {
                    const percentage = parseParameterNumber(parameters[name]);
                    return parameters[name] !== '' ? (
                        <StyledValueContainer
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Box sx={{ mr: 2 }}>
                                <PercentageCircle
                                    percentage={percentage}
                                    size='2rem'
                                />
                            </Box>
                            <div>
                                {nameItem}
                                {isSetTo}
                                <Badge color='success'>{percentage}%</Badge>
                            </div>
                        </StyledValueContainer>
                    ) : null;
                }

                case 'boolean':
                    return parameters[name] === 'true' ||
                        parameters[name] === 'false' ? (
                        <StyledValueContainer>
                            <StringTruncator
                                maxLength={15}
                                maxWidth='150'
                                text={name}
                            />
                            {isSetTo}
                            <Badge
                                color={
                                    parameters[name] === 'true'
                                        ? 'success'
                                        : 'error'
                                }
                            >
                                {parameters[name]}
                            </Badge>
                        </StyledValueContainer>
                    ) : null;

                case 'string': {
                    const value = parseParameterString(parameters[name]);
                    return typeof parameters[name] !== 'undefined' ? (
                        <StyledValueContainer>
                            {nameItem}
                            <ConditionallyRender
                                condition={value === ''}
                                show={
                                    <StyledValueSeparator>
                                        {' is an empty string'}
                                    </StyledValueSeparator>
                                }
                                elseShow={
                                    <>
                                        {isSetTo}
                                        <StringTruncator
                                            maxWidth='300'
                                            text={value}
                                            maxLength={50}
                                        />
                                    </>
                                }
                            />
                        </StyledValueContainer>
                    ) : null;
                }

                case 'number': {
                    const number = parseParameterNumber(parameters[name]);
                    return parameters[name] !== '' && number !== undefined ? (
                        <StyledValueContainer>
                            {nameItem}
                            {isSetTo}
                            <StringTruncator
                                maxWidth='300'
                                text={String(number)}
                                maxLength={50}
                            />
                        </StyledValueContainer>
                    ) : null;
                }
                case 'default':
                    return null;
            }

            return null;
        });
    }, [parameters, definition]);

    if (!parameters) {
        return <NoItems />;
    }

    const listItems = [
        strategySegments && strategySegments.length > 0 && (
            <FeatureOverviewSegment
                segments={strategySegments}
                disabled={strategy.disabled}
            />
        ),
        constraints.length > 0 && (
            <ConstraintAccordionList
                constraints={constraints}
                showLabel={false}
            />
        ),
        strategy.name === 'default' && (
            <>
                <StyledValueContainer sx={{ width: '100%' }}>
                    The standard strategy is <Badge color='success'>ON</Badge>{' '}
                    for all users.
                </StyledValueContainer>
            </>
        ),
        ...(parametersList ?? []),
        ...(customStrategyList ?? []),
    ].filter(Boolean);

    return (
        <>
            <ConditionallyRender
                condition={
                    !BuiltInStrategies.includes(strategy.name || 'default')
                }
                show={<CustomStrategyDeprecationWarning />}
            />

            <ConditionallyRender
                condition={listItems.length > 0}
                show={
                    <StyledContainer disabled={Boolean(strategy.disabled)}>
                        {listItems.map((item, index) => (
                            <Fragment key={index}>
                                <ConditionallyRender
                                    condition={index > 0}
                                    show={<StrategySeparator text='AND' />}
                                />
                                {item}
                            </Fragment>
                        ))}
                    </StyledContainer>
                }
                elseShow={<NoItems />}
            />
        </>
    );
};
