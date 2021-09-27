import { Fragment } from 'react';
import { IConstraint, IParameter } from '../../../../../interfaces/strategy';
import ConditionallyRender from '../../../../common/ConditionallyRender';
import PercentageCircle from '../../../../common/PercentageCircle/PercentageCircle';
import FeatureStrategiesSeparator from '../FeatureStrategiesEnvironments/FeatureStrategiesSeparator/FeatureStrategiesSeparator';
import { useStyles } from './FeatureStrategyExecution.styles';
import FeatureStrategyExecutionConstraint from './FeatureStrategyExecutionConstraint/FeatureStrategyExecutionConstraint';
import FeatureStrategyExecutionChips from './FeatureStrategyExecutionChips/FeatureStrategyExecutionChips';

interface IFeatureStrategiesExecutionProps {
    parameters: IParameter;
    constraints?: IConstraint[];
}

const FeatureStrategyExecution = ({
    parameters,
    constraints = [],
}: IFeatureStrategiesExecutionProps) => {
    const styles = useStyles();

    if (!parameters) return null;

    const renderConstraints = () => {
        return constraints.map((constraint, index) => {
            if (index !== constraints.length - 1) {
                return (
                    <Fragment key={`${constraint.contextName}-${index}`}>
                        <FeatureStrategyExecutionConstraint
                            constraint={constraint}
                        />
                        <FeatureStrategiesSeparator text="AND" />
                    </Fragment>
                );
            }
            return (
                <FeatureStrategyExecutionConstraint
                    constraint={constraint}
                    key={`${constraint.contextName}-${index}`}
                />
            );
        });
    };

    const renderParameters = () => {
        return Object.keys(parameters).map((key, index) => {
            switch (key) {
                case 'rollout':
                case 'Rollout':
                    return (
                        <Fragment key={key}>
                            <p className={styles.text}>
                                {parameters[key]}% of your user base{' '}
                                {constraints.length > 0
                                    ? 'who match constraints'
                                    : ''}{' '}
                                are included.
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
                        <FeatureStrategyExecutionChips
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
                        <FeatureStrategyExecutionChips
                            value={hosts}
                            text={'host'}
                        />
                    );
                case 'IPs':
                    const IPs = parameters[key]
                        .split(',')
                        .filter((hosts: string) => hosts);

                    return (
                        <FeatureStrategyExecutionChips
                            value={IPs}
                            text={'IP'}
                        />
                    );
                default:
                    return null;
            }
        });
    };

    return (
        <>
            <ConditionallyRender
                condition={constraints.length > 0}
                show={
                    <div className={styles.constraintsContainer}>
                        <p>Enabled for match:</p>
                        {renderConstraints()}
                        <FeatureStrategiesSeparator text="AND" />
                    </div>
                }
            />
            {renderParameters()}
        </>
    );
};

export default FeatureStrategyExecution;
