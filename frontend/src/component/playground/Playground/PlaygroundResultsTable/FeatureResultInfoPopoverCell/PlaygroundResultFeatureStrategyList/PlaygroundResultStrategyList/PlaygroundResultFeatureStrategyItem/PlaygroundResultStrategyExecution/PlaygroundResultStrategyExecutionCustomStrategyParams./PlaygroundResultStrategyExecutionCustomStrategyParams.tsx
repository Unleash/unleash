import {
    parseParameterNumber,
    parseParameterString,
    parseParameterStrings,
} from 'utils/parseParameter';
import React, { Fragment } from 'react';
import { PlaygroundConstraintItem } from '../PlaygroundConstraintItem/PlaygroundConstraintItem';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { Chip } from '@mui/material';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { IStrategy } from 'interfaces/strategy';
import { PlaygroundConstraintSchema } from 'hooks/api/actions/usePlayground/playground.model';
import { useStyles } from '../PlaygroundResultStrategyExecution.styles';
import { useStrategies } from '../../../../../../../../../../hooks/api/getters/useStrategies/useStrategies';

interface PlaygroundResultStrategyExecutionCustomStrategyProps {
    parameters: { [key: string]: string };
    strategyName: string;
    constraints: PlaygroundConstraintSchema[];
}

export const PlaygroundResultStrategyExecutionCustomStrategyParams = ({
    strategyName,
    constraints,
    parameters,
}: PlaygroundResultStrategyExecutionCustomStrategyProps) => {
    const { classes: styles } = useStyles();
    const { strategies } = useStrategies();

    const definition = strategies.find(strategyDefinition => {
        return strategyDefinition.name === strategyName;
    });

    const renderCustomStrategyParameters = () => {
        if (!definition?.editable) return null;
        return definition?.parameters.map((param: any, index: number) => {
            const notLastItem = index !== definition?.parameters?.length - 1;
            switch (param?.type) {
                case 'list':
                    const values = parseParameterStrings(
                        parameters[param.name]
                    );
                    return (
                        <Fragment key={param?.name}>
                            <PlaygroundConstraintItem
                                value={values}
                                text={param.name}
                            />
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
                                    label={`${parameters[param.name]}%`}
                                />{' '}
                                of your base{' '}
                                {constraints?.length > 0
                                    ? 'who match constraints'
                                    : ''}{' '}
                                is included.
                            </div>
                            <PercentageCircle
                                percentage={parseParameterNumber(
                                    parameters[param.name]
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
                                {parameters[param.name]}
                            </p>
                            <ConditionallyRender
                                condition={
                                    typeof parameters[param.name] !==
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
                    const value = parseParameterString(parameters[param.name]);
                    return (
                        <ConditionallyRender
                            condition={
                                typeof parameters[param.name] !== 'undefined'
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
                    const number = parseParameterNumber(parameters[param.name]);
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

    return <>{renderCustomStrategyParameters()}</>;
};
