import { Fragment, useMemo, VFC } from 'react';
import { Box, Chip, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { ConstraintItem } from './ConstraintItem/ConstraintItem';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { FeatureOverviewSegment } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewSegment/FeatureOverviewSegment';
import { ConstraintAccordionList } from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';
import {
    parseParameterNumber,
    parseParameterString,
    parseParameterStrings,
} from 'utils/parseParameter';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { Badge } from 'component/common/Badge/Badge';
import { CreateFeatureStrategySchema } from 'openapi';
import { IFeatureStrategyPayload } from 'interfaces/strategy';

interface IStrategyExecutionProps {
    strategy: IFeatureStrategyPayload | CreateFeatureStrategySchema;
}

const NoItems: VFC = () => (
    <Box sx={{ px: 3, color: 'text.disabled' }}>
        This strategy does not have constraints or parameters.
    </Box>
);

const StyledValueContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 3),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledValueSeparator = styled('span')(({ theme }) => ({
    color: theme.palette.neutral.main,
}));

export const StrategyExecution: VFC<IStrategyExecutionProps> = ({
    strategy,
}) => {
    const { parameters, constraints = [] } = strategy;
    const { strategies } = useStrategies();
    const { uiConfig } = useUiConfig();
    const { segments } = useSegments();
    const strategySegments = segments?.filter(segment => {
        return strategy.segments?.includes(segment.id);
    });

    const definition = strategies.find(strategyDefinition => {
        return strategyDefinition.name === strategy.name;
    });

    const parametersList = useMemo(() => {
        if (!parameters || definition?.editable) return null;

        return Object.keys(parameters).map(key => {
            switch (key) {
                case 'rollout':
                case 'Rollout':
                    const percentage = parseParameterNumber(parameters[key]);

                    return (
                        <StyledValueContainer
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Box sx={{ mr: 2 }}>
                                <PercentageCircle
                                    percentage={percentage}
                                    size="2rem"
                                />
                            </Box>
                            <div>
                                <Badge color="success">{percentage}%</Badge> of
                                your base{' '}
                                {constraints.length > 0
                                    ? 'who match constraints'
                                    : ''}{' '}
                                is included.
                            </div>
                        </StyledValueContainer>
                    );
                case 'userIds':
                case 'UserIds':
                    const users = parseParameterStrings(parameters[key]);
                    return (
                        <ConstraintItem key={key} value={users} text="user" />
                    );
                case 'hostNames':
                case 'HostNames':
                    const hosts = parseParameterStrings(parameters[key]);
                    return (
                        <ConstraintItem key={key} value={hosts} text={'host'} />
                    );
                case 'IPs':
                    const IPs = parseParameterStrings(parameters[key]);
                    return <ConstraintItem key={key} value={IPs} text={'IP'} />;
                case 'stickiness':
                case 'groupId':
                    return null;
                default:
                    return null;
            }
        });
    }, [parameters, definition, constraints]);

    const customStrategyList = useMemo(() => {
        if (!parameters || !definition?.editable) return null;
        const isSetTo = (
            <StyledValueSeparator>{' is set to '}</StyledValueSeparator>
        );

        return definition?.parameters.map(param => {
            const { type, name } = { ...param };
            if (!type || !name || parameters[name] === undefined) {
                return null;
            }
            const nameItem = (
                <StringTruncator maxLength={15} maxWidth="150" text={name} />
            );

            switch (param?.type) {
                case 'list':
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
                                                maxWidth="300"
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

                case 'percentage':
                    const percentage = parseParameterNumber(parameters[name]);
                    return parameters[name] !== '' ? (
                        <StyledValueContainer
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Box sx={{ mr: 2 }}>
                                <PercentageCircle
                                    percentage={percentage}
                                    size="2rem"
                                />
                            </Box>
                            <div>
                                {nameItem}
                                {isSetTo}
                                <Badge color="success">{percentage}%</Badge>
                            </div>
                        </StyledValueContainer>
                    ) : null;

                case 'boolean':
                    return parameters[name] === 'true' ||
                        parameters[name] === 'false' ? (
                        <StyledValueContainer>
                            <StringTruncator
                                maxLength={15}
                                maxWidth="150"
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

                case 'string':
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
                                            maxWidth="300"
                                            text={value}
                                            maxLength={50}
                                        />
                                    </>
                                }
                            />
                        </StyledValueContainer>
                    ) : null;

                case 'number':
                    const number = parseParameterNumber(parameters[name]);
                    return parameters[name] !== '' && number !== undefined ? (
                        <StyledValueContainer>
                            {nameItem}
                            {isSetTo}
                            <StringTruncator
                                maxWidth="300"
                                text={String(number)}
                                maxLength={50}
                            />
                        </StyledValueContainer>
                    ) : null;
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
        Boolean(uiConfig.flags.SE) &&
            strategySegments &&
            strategySegments.length > 0 && (
                <FeatureOverviewSegment segments={strategySegments} />
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
                    The standard strategy is <Badge color="success">ON</Badge>{' '}
                    for all users.
                </StyledValueContainer>
            </>
        ),
        ...(parametersList ?? []),
        ...(customStrategyList ?? []),
    ].filter(Boolean);

    return (
        <ConditionallyRender
            condition={listItems.length > 0}
            show={
                <>
                    {listItems.map((item, index) => (
                        <Fragment key={index}>
                            <ConditionallyRender
                                condition={index > 0}
                                show={<StrategySeparator text="AND" />}
                            />
                            {item}
                        </Fragment>
                    ))}
                </>
            }
            elseShow={<NoItems />}
        />
    );
};
