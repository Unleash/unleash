import { Fragment, useMemo, VFC } from 'react';
import { Box, Chip } from '@mui/material';
import { IFeatureStrategy } from 'interfaces/strategy';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { ConstraintItem } from './ConstraintItem/ConstraintItem';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { FeatureOverviewSegment } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewSegment/FeatureOverviewSegment';
import { ConstraintAccordionList } from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';
import { useStyles } from './StrategyExecution.styles';
import {
    parseParameterNumber,
    parseParameterString,
    parseParameterStrings,
} from 'utils/parseParameter';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';

interface IStrategyExecutionProps {
    strategy: IFeatureStrategy;
}

const NoItems: VFC = () => (
    <Box sx={{ px: 3, color: 'text.disabled' }}>
        This strategy does not have constraints or parameters.
    </Box>
);

export const StrategyExecution: VFC<IStrategyExecutionProps> = ({
    strategy,
}) => {
    const { parameters, constraints = [] } = strategy;
    const { classes: styles } = useStyles();
    const { strategies } = useStrategies();
    const { uiConfig } = useUiConfig();
    const { segments } = useSegments(strategy.id);

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
                        <Box
                            className={styles.valueContainer}
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Box sx={{ mr: 2 }}>
                                <PercentageCircle
                                    percentage={percentage}
                                    size="2rem"
                                />
                            </Box>
                            <div>
                                <Chip
                                    color="success"
                                    variant="outlined"
                                    size="small"
                                    label={`${percentage}%`}
                                />{' '}
                                of your base{' '}
                                {constraints.length > 0
                                    ? 'who match constraints'
                                    : ''}{' '}
                                is included.
                            </div>
                        </Box>
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
    }, [parameters, definition, constraints, styles]);

    const customStrategyList = useMemo(() => {
        if (!parameters || !definition?.editable) return null;
        const isSetTo = (
            <span className={styles.valueSeparator}>{' is set to '}</span>
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
                        <div className={styles.valueContainer}>
                            {nameItem}{' '}
                            <span className={styles.valueSeparator}>
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
                            </span>
                        </div>
                    ) : null;

                case 'percentage':
                    const percentage = parseParameterNumber(parameters[name]);
                    return parameters[name] !== '' ? (
                        <Box
                            className={styles.valueContainer}
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
                                <Chip
                                    color="success"
                                    variant="outlined"
                                    size="small"
                                    label={`${percentage}%`}
                                />
                            </div>
                        </Box>
                    ) : null;

                case 'boolean':
                    return parameters[name] === 'true' ||
                        parameters[name] === 'false' ? (
                        <div className={styles.valueContainer}>
                            <StringTruncator
                                maxLength={15}
                                maxWidth="150"
                                text={name}
                            />
                            {isSetTo}
                            <Chip
                                color={
                                    parameters[name] === 'true'
                                        ? 'success'
                                        : 'error'
                                }
                                variant="outlined"
                                size="small"
                                label={parameters[name]}
                            />
                        </div>
                    ) : null;

                case 'string':
                    const value = parseParameterString(parameters[name]);
                    return typeof parameters[name] !== 'undefined' ? (
                        <div className={styles.valueContainer}>
                            {nameItem}
                            <ConditionallyRender
                                condition={value === ''}
                                show={
                                    <span className={styles.valueSeparator}>
                                        {' is an empty string'}
                                    </span>
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
                        </div>
                    ) : null;

                case 'number':
                    const number = parseParameterNumber(parameters[name]);
                    return parameters[name] !== '' && number !== undefined ? (
                        <div className={styles.valueContainer}>
                            {nameItem}
                            {isSetTo}
                            <StringTruncator
                                maxWidth="300"
                                text={String(number)}
                                maxLength={50}
                            />
                        </div>
                    ) : null;
                case 'default':
                    return null;
            }

            return null;
        });
    }, [parameters, definition, styles]);

    if (!parameters) {
        return <NoItems />;
    }

    const listItems = [
        Boolean(uiConfig.flags.SE) && segments && segments.length > 0 && (
            <FeatureOverviewSegment strategyId={strategy.id} />
        ),
        constraints.length > 0 && (
            <ConstraintAccordionList
                constraints={constraints}
                showLabel={false}
            />
        ),
        strategy.name === 'default' && (
            <>
                <Box sx={{ width: '100%' }} className={styles.valueContainer}>
                    The standard strategy is{' '}
                    <Chip
                        variant="outlined"
                        size="small"
                        color="success"
                        label="ON"
                    />{' '}
                    for all users.
                </Box>
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
