import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Tooltip,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import React from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import useFeature from '../../../../../../hooks/api/getters/useFeature/useFeature';
import useFeatureMetrics from '../../../../../../hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import { IFeatureEnvironment } from '../../../../../../interfaces/featureToggle';
import { IFeatureViewParams } from '../../../../../../interfaces/params';
import { getFeatureMetrics } from '../../../../../../utils/get-feature-metrics';
import {
    getFeatureStrategyIcon,
    getHumanReadableStrategyName,
} from '../../../../../../utils/strategy-names';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import DisabledIndicator from '../../../../../common/DisabledIndicator/DisabledIndicator';
import EnvironmentIcon from '../../../../../common/EnvironmentIcon/EnvironmentIcon';
import PermissionButton from '../../../../../common/PermissionButton/PermissionButton';
import StringTruncator from '../../../../../common/StringTruncator/StringTruncator';
import { CREATE_FEATURE_STRATEGY } from '../../../../../providers/AccessProvider/permissions';

import { useStyles } from './FeatureOverviewEnvironment.styles';
import FeatureOverviewEnvironmentBody from './FeatureOverviewEnvironmentBody/FeatureOverviewEnvironmentBody';
import FeatureOverviewEnvironmentFooter from './FeatureOverviewEnvironmentFooter/FeatureOverviewEnvironmentFooter';
import FeatureOverviewEnvironmentMetrics from './FeatureOverviewEnvironmentMetrics/FeatureOverviewEnvironmentMetrics';

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
    const history = useHistory();

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

    const strategiesLink = `/projects/${projectId}/features2/${featureId}/strategies?environment=${featureEnvironment?.name}&addStrategy=true`;

    const getStrategyIcons = () => {
        const strategyObjects = featureEnvironment?.strategies.reduce(
            (acc, current) => {
                if (acc[current.name]) {
                    acc[current.name].count = acc[current.name].count + 1;
                } else {
                    acc[current.name] = {
                        count: 1,
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
            <Accordion style={{ boxShadow: 'none' }}>
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
                            Feature toggle execution for&nbsp;
                            <StringTruncator
                                text={env.name}
                                className={styles.truncator}
                                maxWidth="100"
                            />
                        </div>
                        <div className={styles.container}>
                            <PermissionButton
                                permission={CREATE_FEATURE_STRATEGY}
                                projectId={projectId}
                                environmentId={env.name}
                                onClick={() => history.push(strategiesLink)}
                                className={styles.addStrategyButton}
                            >
                                Add strategy
                            </PermissionButton>
                            <ConditionallyRender
                                condition={
                                    featureEnvironment?.strategies.length !== 0
                                }
                                show={
                                    <>
                                        <span className={styles.separator}>
                                            |
                                        </span>
                                        <div
                                            className={
                                                styles.strategiesIconsContainer
                                            }
                                        >
                                            {getStrategyIcons()?.map(
                                                ({ name, Icon }) => (
                                                    <Tooltip
                                                        title={getHumanReadableStrategyName(
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
                                featureEnvironment?.strategies?.length > 0
                            }
                            show={
                                <FeatureOverviewEnvironmentFooter
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
