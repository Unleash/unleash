import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Tooltip,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import React from 'react';
import { useParams } from 'react-router';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useFeatureMetrics from 'hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { IFeatureViewParams } from 'interfaces/params';
import { getFeatureMetrics } from 'utils/getFeatureMetrics';
import {
    getFeatureStrategyIcon,
    formatStrategyName,
} from 'utils/strategyNames';
import ConditionallyRender from 'component/common/ConditionallyRender';
import DisabledIndicator from 'component/common/DisabledIndicator/DisabledIndicator';
import EnvironmentIcon from 'component/common/EnvironmentIcon/EnvironmentIcon';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { useStyles } from './FeatureOverviewEnvironment.styles';
import FeatureOverviewEnvironmentBody from './FeatureOverviewEnvironmentBody/FeatureOverviewEnvironmentBody';
import FeatureOverviewEnvironmentFooter from './FeatureOverviewEnvironmentFooter/FeatureOverviewEnvironmentFooter';
import FeatureOverviewEnvironmentMetrics from './FeatureOverviewEnvironmentMetrics/FeatureOverviewEnvironmentMetrics';
import { FeatureStrategyMenu } from 'component/feature/FeatureStrategy/FeatureStrategyMenu/FeatureStrategyMenu';
import { FEATURE_ENVIRONMENT_ACCORDION } from 'utils/testIds';

interface IStrategyIconObject {
    count: number;
    Icon: React.ReactElement;
    name: string;
}

interface IFeatureOverviewEnvironmentProps {
    env: IFeatureEnvironment;
}

const FeatureOverviewEnvironment = ({
    env,
}: IFeatureOverviewEnvironmentProps) => {
    const styles = useStyles();
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { metrics } = useFeatureMetrics(projectId, featureId);
    const { feature } = useFeature(projectId, featureId);

    const featureMetrics = getFeatureMetrics(feature?.environments, metrics);
    const environmentMetric = featureMetrics.find(
        featureMetric => featureMetric.environment === env.name
    );
    const featureEnvironment = feature?.environments.find(
        featureEnvironment => featureEnvironment.name === env.name
    );

    const getOverviewText = () => {
        if (env.enabled) {
            return `${environmentMetric?.yes} received this feature
                                because the following strategies are executing`;
        }
        return `This environment is disabled, which means that none of your strategies are executing`;
    };

    const getStrategyIcons = () => {
        const strategyObjects = featureEnvironment?.strategies.reduce(
            (acc, current) => {
                if (acc[current.name]) {
                    acc[current.name].count = acc[current.name].count + 1;
                } else {
                    acc[current.name] = {
                        count: 1,
                        // @ts-expect-error
                        Icon: getFeatureStrategyIcon(current.name),
                    };
                }
                return acc;
            },
            {} as { [key: string]: IStrategyIconObject }
        );

        if (!strategyObjects) return [];

        return Object.keys(strategyObjects).map(strategyName => {
            return { ...strategyObjects[strategyName], name: strategyName };
        });
    };

    return (
        <div className={styles.featureOverviewEnvironment}>
            <Accordion
                style={{ boxShadow: 'none' }}
                data-test={`${FEATURE_ENVIRONMENT_ACCORDION}_${env.name}`}
            >
                <AccordionSummary
                    className={styles.accordionHeader}
                    expandIcon={<ExpandMore />}
                >
                    <div className={styles.header} data-loading>
                        <div className={styles.headerTitle}>
                            <EnvironmentIcon
                                enabled={env.enabled}
                                className={styles.headerIcon}
                            />
                            <p>
                                Feature toggle execution for&nbsp;
                                <StringTruncator
                                    text={env.name}
                                    className={styles.truncator}
                                    maxWidth="100"
                                    maxLength={15}
                                />
                            </p>
                        </div>
                        <div className={styles.container}>
                            <div className={styles.strategyMenu}>
                                <FeatureStrategyMenu
                                    label="Add strategy"
                                    projectId={projectId}
                                    featureId={featureId}
                                    environmentId={env.name}
                                    variant="text"
                                />
                            </div>
                            <ConditionallyRender
                                condition={
                                    featureEnvironment?.strategies.length !== 0
                                }
                                show={
                                    <>
                                        <div
                                            className={
                                                styles.strategiesIconsContainer
                                            }
                                        >
                                            {getStrategyIcons()?.map(
                                                ({ name, Icon }) => (
                                                    <Tooltip
                                                        title={formatStrategyName(
                                                            name
                                                        )}
                                                        arrow
                                                        key={name}
                                                    >
                                                        <div
                                                            className={
                                                                styles.strategyIconContainer
                                                            }
                                                        >
                                                            {/* @ts-expect-error */}
                                                            <Icon
                                                                className={
                                                                    styles.strategyIcon
                                                                }
                                                            />
                                                        </div>
                                                    </Tooltip>
                                                )
                                            )}
                                        </div>{' '}
                                    </>
                                }
                            />
                        </div>
                        <ConditionallyRender
                            condition={!env.enabled}
                            show={
                                <DisabledIndicator
                                    className={styles.disabledIndicatorPos}
                                />
                            }
                        />
                    </div>

                    <FeatureOverviewEnvironmentMetrics
                        environmentMetric={environmentMetric}
                    />
                </AccordionSummary>

                <AccordionDetails>
                    <div className={styles.accordionContainer}>
                        <FeatureOverviewEnvironmentBody
                            featureEnvironment={featureEnvironment}
                            getOverviewText={getOverviewText}
                        />
                        <ConditionallyRender
                            condition={
                                // @ts-expect-error
                                featureEnvironment?.strategies?.length > 0
                            }
                            show={
                                <FeatureOverviewEnvironmentFooter
                                    // @ts-expect-error
                                    env={env}
                                    environmentMetric={environmentMetric}
                                />
                            }
                        />
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    );
};

export default FeatureOverviewEnvironment;
