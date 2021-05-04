import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { useStyles } from './StrategyCardConstraints.styles.js';
import ConditionallyRender from '../../../../../../common/ConditionallyRender/ConditionallyRender';
import { C } from '../../../../../../common/flags.js';

const StrategyCardConstraints = ({ constraints= [], flags }) => {
    const styles = useStyles();

    const isEnterprise = () => {
        if (!flags) return false;
        if (flags[C]) {
            return true;
        }
        return false;
    };

    const renderConstraintValues = constraint => {
        const multiple = constraint.values.length > 1;
        return constraint.values.map((value, index) => {
            const notLastItem = index !== constraint.values.length - 1;
            return (
                <ConditionallyRender
                    key={value}
                    condition={multiple && notLastItem}
                    show={<span>'{value}',</span>}
                    elseShow={<span>'{value}'</span>}
                />
            );
        });
    };

    const renderConstraints = () => {
        return constraints.map((constraint, i) => (
            <div key={`${constraint.contextName}-${constraint.operator}`}>
                <ConditionallyRender
                    condition={i > 0}
                    show={<span>and</span>}
                />
                <pre
                    key={`${constraint.contextName}-${i}`}
                    className={classnames(styles.constraintContainer)}
                >
                    <span>{constraint.contextName}</span>

                    <span>{constraint.operator}</span>

                    {renderConstraintValues(constraint)}
                </pre>
            </div>
        ));
    };

    return (
        <>
            <Typography className={styles.title} variant="subtitle1">
                Constraints
            </Typography>

            <ConditionallyRender
                condition={constraints && constraints.length > 0}
                show={
                    <>
                        <Typography variant="body2">
                            The following pre-conditions must be fulfilled for
                            this strategy to be executed
                        </Typography>
                        <div className={styles.constraints}>
                            {renderConstraints()}
                        </div>
                    </>
                }
                elseShow={
                    <>
                        <Typography variant="body2">
                            No pre-conditions defined for this strategy.
                        </Typography>
                        <ConditionallyRender
                            condition={isEnterprise()}
                            show={
                                <Typography
                                    variant="body2"
                                    className={styles.placeholderText}
                                >
                                    Constraints allow you fine grained control
                                    over how to execute your strategies.
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.link}
                                        href="https://docs.getunleash.io/docs/advanced/strategy_constraints"
                                    >
                                        Learn more
                                    </a>
                                </Typography>
                            }
                            elseShow={
                                <Typography
                                    variant="body2"
                                    className={styles.placeholderText}
                                >
                                    Constraints are only available as an
                                    enterprise feature.{' '}
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.link}
                                        href="https://docs.getunleash.io/docs/advanced/strategy_constraints"
                                    >
                                        Learn more
                                    </a>
                                </Typography>
                            }
                        />
                    </>
                }
            />
        </>
    );
};

StrategyCardConstraints.propTypes = {
    constraints: PropTypes.array,
};

export default StrategyCardConstraints;
