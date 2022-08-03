import { ConditionallyRender } from '../../../../../../../../common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from '../../../../../../../../common/StrategySeparator/StrategySeparator';
import { Box, Chip, styled } from '@mui/material';
import { useStyles } from './PlaygroundResultStrategyExecution.styles';
import {
    PlaygroundRequestSchema,
    PlaygroundStrategySchema,
} from '../../../../../../../../../hooks/api/actions/usePlayground/playground.model';
import useUiConfig from '../../../../../../../../../hooks/api/getters/useUiConfig/useUiConfig';
import React, { Fragment } from 'react';
import { PlaygroundResultConstraintExecution } from '../PlaygroundResultConstraintExecution/PlaygroundResultConstraintExecution';
import { PlaygroundResultSegmentExecution } from '../PlaygroundResultSegmentExecution/PlaygroundResultSegmentExecution';
import {
    parseParameterNumber,
    parseParameterString,
    parseParameterStrings,
} from '../../../../../../../../../utils/parseParameter';
import PercentageCircle from '../../../../../../../../common/PercentageCircle/PercentageCircle';
import StringTruncator from '../../../../../../../../common/StringTruncator/StringTruncator';
import { useStrategies } from '../../../../../../../../../hooks/api/getters/useStrategies/useStrategies';
import { PlaygroundConstraintItem } from '../PlaygroundConstraintItem/PlaygroundConstraintItem';
import {
    ConstraintItem
} from "../../../../../../../../feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/ConstraintItem/ConstraintItem";

interface PlaygroundResultStrategyExecutionProps {
    strategyResult: PlaygroundStrategySchema;
    percentageFill?: string;
    input?: PlaygroundRequestSchema;
}

const StyledStrategyExecutionWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(1),
}));

export const PlaygroundResultStrategyExecution = ({
    strategyResult,
    input,
}: PlaygroundResultStrategyExecutionProps) => {
    const { name, constraints, segments, parameters } = strategyResult;
    const { strategies } = useStrategies();
    const { uiConfig } = useUiConfig();
    const { classes: styles } = useStyles();

    const hasConstraints = Boolean(constraints && constraints.length > 0);

    if (!parameters) {
        return null;
    }

    const definition = strategies.find(strategyDefinition => {
        return strategyDefinition.name === strategyResult.name;
    });

    const renderParameters = () => {
        return Object.keys(parameters).map(key => {
            switch (key) {
                case 'rollout':
                case 'Rollout':
                    const percentage = parseParameterNumber(parameters[key]);
                    return (
                        <Box
                            className={styles.summary}
                            key={key}
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Box sx={{ mr: '1rem' }}>
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
                        <PlaygroundConstraintItem
                            key={key}
                            value={users}
                            text="user"
                            input={
                                Boolean(input?.context?.[key])
                                    ? input?.context?.[key]
                                    : 'no value'
                            }
                            showReason={
                                Boolean(input?.context?.[key])
                                    ? !users.includes(input?.context?.[key])
                                    : undefined
                            }
                        />
                    );
                case 'hostNames':
                case 'HostNames':
                    const hosts = parseParameterStrings(parameters[key]);
                    console.log(input?.context);
                    console.log(key);
                    console.log(input?.context?.[key]);
                    console.log(hosts.includes(input?.context?.[key]));
                    return (
                        <PlaygroundConstraintItem
                            key={key}
                            value={hosts}
                            text={'host'}
                            input={
                                Boolean(input?.context?.[key])
                                    ? input?.context?.[key]
                                    : 'no value'
                            }
                            showReason={
                                Boolean(input?.context?.[key])
                                    ? !hosts.includes(input?.context?.[key])
                                    : undefined
                            }
                        />
                    );
                case 'IPs':
                    const IPs = parseParameterStrings(parameters[key]);
                    return (
                        <PlaygroundConstraintItem
                            key={key}
                            value={IPs}
                            text={'IP'}
                            input={
                                Boolean(input?.context?.[key])
                                    ? input?.context?.[key]
                                    : 'no value'
                            }
                            showReason={
                                Boolean(input?.context?.[key])
                                    ? !IPs.includes(input?.context?.[key])
                                    : undefined
                            }
                        />
                    );
                case 'stickiness':
                case 'groupId':
                    return null;
                default:
                    return null;
            }
        });
    };

    const renderCustomStrategy = () => {
        if (!definition?.editable) return null;
        return definition?.parameters.map((param: any, index: number) => {
            const notLastItem = index !== definition?.parameters?.length - 1;
            switch (param?.type) {
                case 'list':
                    const values = parseParameterStrings(
                        strategyResult?.parameters[param.name]
                    );
                    return (
                        <Fragment key={param?.name}>
                            <ConstraintItem value={values} text={param.name} />
                            <ConditionallyRender
                                condition={notLastItem}
                                show={<StrategySeparator text="AND" />}
                            />
                        </Fragment>
                    );
                case 'percentage':
                    return (
                        <Fragment key={param?.name}>
                            <div>
                                <Chip
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    label={`${
                                        strategyResult?.parameters[param.name]
                                    }%`}
                                />{' '}
                                of your base{' '}
                                {constraints?.length > 0
                                    ? 'who match constraints'
                                    : ''}{' '}
                                is included.
                            </div>
                            <PercentageCircle
                                percentage={parseParameterNumber(
                                    strategyResult.parameters[param.name]
                                )}
                            />
                            <ConditionallyRender
                                condition={notLastItem}
                                show={<StrategySeparator text="AND" />}
                            />
                        </Fragment>
                    );
                case 'boolean':
                    return (
                        <Fragment key={param.name}>
                            <p key={param.name}>
                                <StringTruncator
                                    maxLength={15}
                                    maxWidth="150"
                                    text={param.name}
                                />{' '}
                                {strategyResult.parameters[param.name]}
                            </p>
                            <ConditionallyRender
                                condition={
                                    typeof strategyResult.parameters[param.name] !==
                                    'undefined'
                                }
                                show={
                                    <ConditionallyRender
                                        condition={notLastItem}
                                        show={<StrategySeparator text="AND" />}
                                    />
                                }
                            />
                        </Fragment>
                    );
                case 'string':
                    const value = parseParameterString(
                        strategyResult.parameters[param.name]
                    );
                    return (
                        <ConditionallyRender
                            condition={
                                typeof strategyResult.parameters[param.name] !==
                                'undefined'
                            }
                            key={param.name}
                            show={
                                <>
                                    <p className={styles.valueContainer}>
                                        <StringTruncator
                                            maxWidth="150"
                                            maxLength={15}
                                            text={param.name}
                                        />
                                        <span className={styles.valueSeparator}>
                                            is set to
                                        </span>
                                        <StringTruncator
                                            maxWidth="300"
                                            text={value}
                                            maxLength={50}
                                        />
                                    </p>
                                    <ConditionallyRender
                                        condition={notLastItem}
                                        show={<StrategySeparator text="AND" />}
                                    />
                                </>
                            }
                        />
                    );
                case 'number':
                    const number = parseParameterNumber(
                        strategyResult.parameters[param.name]
                    );
                    return (
                        <ConditionallyRender
                            condition={number !== undefined}
                            key={param.name}
                            show={
                                <>
                                    <p className={styles.valueContainer}>
                                        <StringTruncator
                                            maxLength={15}
                                            maxWidth="150"
                                            text={param.name}
                                        />
                                        <span className={styles.valueSeparator}>
                                            is set to
                                        </span>
                                        <StringTruncator
                                            maxWidth="300"
                                            text={String(number)}
                                            maxLength={50}
                                        />
                                    </p>
                                    <ConditionallyRender
                                        condition={notLastItem}
                                        show={<StrategySeparator text="AND" />}
                                    />
                                </>
                            }
                        />
                    );
                case 'default':
                    return null;
            }
            return null;
        });
    };

    return (
        <StyledStrategyExecutionWrapper>
            <ConditionallyRender
                condition={
                    Boolean(uiConfig.flags.SE) &&
                    Boolean(segments && segments.length > 0)
                }
                show={
                    <PlaygroundResultSegmentExecution
                        segments={segments}
                        hasConstraints={hasConstraints}
                        input={input}
                    />
                }
            />
            <ConditionallyRender
                condition={Boolean(constraints && constraints.length > 0)}
                show={
                    <>
                        <PlaygroundResultConstraintExecution
                            constraints={constraints}
                            compact={true}
                            input={input}
                        />
                        <ConditionallyRender
                            condition={Boolean(
                                constraints && constraints.length > 0
                            )}
                            show={<StrategySeparator text="AND" />}
                        />
                    </>
                }
            />
            <ConditionallyRender
                condition={name === 'default'}
                show={
                    <Box sx={{ width: '100%' }} className={styles.summary}>
                        The standard strategyResult is{' '}
                        <Chip
                            variant="outlined"
                            size="small"
                            color="success"
                            label="ON"
                        />{' '}
                        for all users.
                    </Box>
                }
            />
            {renderParameters()}
            {renderCustomStrategy()}
        </StyledStrategyExecutionWrapper>
    );
};
