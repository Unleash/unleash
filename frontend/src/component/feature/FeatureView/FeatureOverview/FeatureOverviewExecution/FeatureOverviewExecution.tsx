import { Fragment } from 'react';
import {
    IFeatureStrategy,
    IFeatureStrategyParameters,
    IConstraint,
} from 'interfaces/strategy';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import FeatureOverviewExecutionChips from './FeatureOverviewExecutionChips/FeatureOverviewExecutionChips';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { FeatureOverviewSegment } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewSegment/FeatureOverviewSegment';
import { ConstraintAccordionList } from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';
import { useStyles } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewExecution/FeatureOverviewExecution.styles';
import {
    parseParameterString,
    parseParameterNumber,
    parseParameterStrings,
} from 'utils/parseParameter';

interface IFeatureOverviewExecutionProps {
    parameters: IFeatureStrategyParameters;
    constraints?: IConstraint[];
    strategy: IFeatureStrategy;
    percentageFill?: string;
}

const FeatureOverviewExecution = ({
    parameters,
    constraints = [],
    strategy,
}: IFeatureOverviewExecutionProps) => {
    const { classes: styles } = useStyles();
    const { strategies } = useStrategies();
    const { uiConfig } = useUiConfig();

    if (!parameters) {
        return null;
    }

    const definition = strategies.find(strategyDefinition => {
        return strategyDefinition.name === strategy.name;
    });

    const renderParameters = () => {
        if (definition?.editable) return null;

        return Object.keys(parameters).map(key => {
            switch (key) {
                case 'rollout':
                case 'Rollout':
                    return (
                        <Fragment key={key}>
                            <p>
                                {parameters[key]}% of your base{' '}
                                {constraints.length > 0
                                    ? 'who match constraints'
                                    : ''}{' '}
                                is included.
                            </p>

                            <PercentageCircle
                                percentage={parseParameterNumber(
                                    parameters[key]
                                )}
                            />
                        </Fragment>
                    );
                case 'userIds':
                case 'UserIds':
                    const users = parseParameterStrings(parameters[key]);
                    return (
                        <FeatureOverviewExecutionChips
                            key={key}
                            value={users}
                            text="user"
                        />
                    );
                case 'hostNames':
                case 'HostNames':
                    const hosts = parseParameterStrings(parameters[key]);
                    return (
                        <FeatureOverviewExecutionChips
                            key={key}
                            value={hosts}
                            text={'host'}
                        />
                    );
                case 'IPs':
                    const IPs = parseParameterStrings(parameters[key]);
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
                    const values = parseParameterStrings(
                        strategy?.parameters[param.name]
                    );
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
                            <p>
                                {strategy?.parameters[param.name]}% of your base{' '}
                                {constraints?.length > 0
                                    ? 'who match constraints'
                                    : ''}{' '}
                                is included.
                            </p>
                            <PercentageCircle
                                percentage={parseParameterNumber(
                                    strategy.parameters[param.name]
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
                                {strategy.parameters[param.name]}
                            </p>
                            <ConditionallyRender
                                condition={
                                    typeof strategy.parameters[param.name] !==
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
                        strategy.parameters[param.name]
                    );
                    return (
                        <ConditionallyRender
                            condition={
                                typeof strategy.parameters[param.name] !==
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
                        strategy.parameters[param.name]
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
        <>
            <ConditionallyRender
                condition={Boolean(uiConfig.flags.SE)}
                show={<FeatureOverviewSegment strategyId={strategy.id} />}
            />
            <ConditionallyRender
                condition={constraints.length > 0}
                show={
                    <>
                        <ConstraintAccordionList constraints={constraints} />
                        <StrategySeparator text="AND" />
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
