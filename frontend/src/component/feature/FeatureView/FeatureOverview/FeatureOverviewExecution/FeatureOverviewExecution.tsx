import { Fragment } from 'react';
import {
    IConstraint,
    IFeatureStrategy,
    IParameter,
} from '../../../../../interfaces/strategy';
import ConditionallyRender from '../../../../common/ConditionallyRender';
import PercentageCircle from '../../../../common/PercentageCircle/PercentageCircle';
import { StrategySeparator } from '../../../../common/StrategySeparator/StrategySeparator';
import { useStyles } from './FeatureOverviewExecution.styles';
import FeatureOverviewExecutionChips from './FeatureOverviewExecutionChips/FeatureOverviewExecutionChips';
import { useStrategies } from '../../../../../hooks/api/getters/useStrategies/useStrategies';
import Constraint from '../../../../common/Constraint/Constraint';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';

interface IFeatureOverviewExecutionProps {
    parameters: IParameter;
    constraints?: IConstraint[];
    strategy: IFeatureStrategy;
    percentageFill?: string;
}

const FeatureOverviewExecution = ({
    parameters,
    constraints = [],
    strategy,
}: IFeatureOverviewExecutionProps) => {
    const styles = useStyles();
    const { strategies } = useStrategies();

    if (!parameters) return null;

    const definition = strategies.find(strategyDefinition => {
        return strategyDefinition.name === strategy.name;
    });

    const renderConstraints = () => {
        return constraints.map((constraint, index) => {
            if (index !== constraints.length - 1) {
                return (
                    <Fragment key={`${constraint.contextName}-${index}`}>
                        <Constraint constraint={constraint} />

                        <StrategySeparator text="AND" />
                    </Fragment>
                );
            }
            return (
                <Constraint
                    constraint={constraint}
                    key={`${constraint.contextName}-${index}`}
                />
            );
        });
    };

    const renderParameters = () => {
        if (definition?.editable) return null;

        return Object.keys(parameters).map((key, index) => {
            switch (key) {
                case 'rollout':
                case 'Rollout':
                    return (
                        <Fragment key={key}>
                            <p className={styles.text}>
                                {parameters[key]}% of your base{' '}
                                {constraints.length > 0
                                    ? 'who match constraints'
                                    : ''}{' '}
                                is included.
                            </p>

                            <PercentageCircle percentage={parameters[key]} />
                        </Fragment>
                    );
                case 'userIds':
                case 'UserIds':
                    const users = parameters[key]
                        .split(',')
                        .filter((userId: string) => userId);

                    return (
                        <FeatureOverviewExecutionChips
                            key={key}
                            value={users}
                            text="user"
                        />
                    );
                case 'hostNames':
                case 'HostNames':
                    const hosts = parameters[key]
                        .split(',')
                        .filter((hosts: string) => hosts);

                    return (
                        <FeatureOverviewExecutionChips
                            key={key}
                            value={hosts}
                            text={'host'}
                        />
                    );
                case 'IPs':
                    const IPs = parameters[key]
                        .split(',')
                        .filter((hosts: string) => hosts);

                    return (
                        <FeatureOverviewExecutionChips
                            key={key}
                            value={IPs}
                            text={'IP'}
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
                    const values = strategy?.parameters[param.name]
                        .split(',')
                        .filter((val: string) => val);

                    return (
                        <Fragment key={param?.name}>
                            <FeatureOverviewExecutionChips
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
                            <p className={styles.text}>
                                {strategy?.parameters[param.name]}% of your base{' '}
                                {constraints?.length > 0
                                    ? 'who match constraints'
                                    : ''}{' '}
                                is included.
                            </p>

                            <PercentageCircle
                                percentage={strategy.parameters[param.name]}
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
                            <p className={styles.text} key={param.name}>
                                <StringTruncator
                                    maxLength={15}
                                    maxWidth="150"
                                    text={param.name}
                                />{' '}
                                {strategy.parameters[param.name]}
                            </p>
                            <ConditionallyRender
                                condition={strategy.parameters[param.name]}
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
                    const numValue = strategy.parameters[param.name];
                    return (
                        <ConditionallyRender
                            condition={numValue !== undefined}
                            key={param.name}
                            show={
                                <>
                                    <p className={styles.text}>
                                        <StringTruncator
                                            maxWidth="150"
                                            maxLength={15}
                                            text={param.name}
                                        />{' '}
                                        is set to {numValue}
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
                    const value = strategy.parameters[param.name];
                    return (
                        <ConditionallyRender
                            condition={value}
                            key={param.name}
                            show={
                                <>
                                    <p className={styles.text}>
                                        <StringTruncator
                                            maxLength={15}
                                            maxWidth="150"
                                            text={param.name}
                                        />{' '}
                                        is set to {value}
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
        <>
            <ConditionallyRender
                condition={constraints.length > 0}
                show={
                    <>
                        <div className={styles.constraintsContainer}>
                            <p>Enabled for match:</p>
                            {renderConstraints()}
                            <StrategySeparator text="AND" />
                        </div>
                    </>
                }
            />
            <ConditionallyRender
                condition={strategy.name === 'default'}
                show={<p>The standard strategy is on for all users.</p>}
            />
            {renderParameters()}
            {renderCustomStrategy()}
        </>
    );
};

export default FeatureOverviewExecution;
