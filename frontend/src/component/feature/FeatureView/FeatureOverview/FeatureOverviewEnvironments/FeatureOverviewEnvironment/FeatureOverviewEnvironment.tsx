import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    useTheme,
} from '@mui/material';
import classNames from 'classnames';
import { ExpandMore } from '@mui/icons-material';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useFeatureMetrics from 'hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { getFeatureMetrics } from 'utils/getFeatureMetrics';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import EnvironmentIcon from 'component/common/EnvironmentIcon/EnvironmentIcon';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { useStyles } from './FeatureOverviewEnvironment.styles';
import EnvironmentAccordionBody from './EnvironmentAccordionBody/EnvironmentAccordionBody';
import { EnvironmentFooter } from './EnvironmentFooter/EnvironmentFooter';
import FeatureOverviewEnvironmentMetrics from './FeatureOverviewEnvironmentMetrics/FeatureOverviewEnvironmentMetrics';
import { FeatureStrategyMenu } from 'component/feature/FeatureStrategy/FeatureStrategyMenu/FeatureStrategyMenu';
import { FEATURE_ENVIRONMENT_ACCORDION } from 'utils/testIds';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { FeatureStrategyIcons } from 'component/feature/FeatureStrategy/FeatureStrategyIcons/FeatureStrategyIcons';
// import { Badge } from 'component/common/Badge/Badge';

interface IFeatureOverviewEnvironmentProps {
    env: IFeatureEnvironment;
}

const FeatureOverviewEnvironment = ({
    env,
}: IFeatureOverviewEnvironmentProps) => {
    const { classes: styles } = useStyles();
    const theme = useTheme();
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { metrics } = useFeatureMetrics(projectId, featureId);
    const { feature } = useFeature(projectId, featureId);

    const featureMetrics = getFeatureMetrics(feature?.environments, metrics);
    const environmentMetric = featureMetrics.find(
        featureMetric => featureMetric.environment === env.name
    );
    const featureEnvironment = feature?.environments.find(
        featureEnvironment => featureEnvironment.name === env.name
    );

    return (
        <div
            className={styles.featureOverviewEnvironment}
            style={{
                background: !env.enabled
                    ? theme.palette.neutral.light
                    : theme.palette.background.paper,
            }}
        >
            <Accordion
                className={styles.accordion}
                data-testid={`${FEATURE_ENVIRONMENT_ACCORDION}_${env.name}`}
            >
                <AccordionSummary
                    className={styles.accordionHeader}
                    expandIcon={<ExpandMore titleAccess="Toggle" />}
                >
                    <div
                        className={styles.header}
                        data-loading
                        style={{
                            color: !env.enabled
                                ? theme.palette.text.secondary
                                : theme.palette.text.primary,
                        }}
                    >
                        <div className={styles.headerTitle}>
                            <EnvironmentIcon
                                enabled={env.enabled}
                                className={styles.headerIcon}
                            />
                            <div>
                                <StringTruncator
                                    text={env.name}
                                    className={styles.truncator}
                                    maxWidth="100"
                                    maxLength={15}
                                />
                            </div>
                            <ConditionallyRender
                                condition={!env.enabled}
                                show={
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        label="Disabled"
                                        sx={{ ml: 1 }}
                                    />
                                }
                            />
                        </div>
                        <div className={styles.container}>
                            <FeatureStrategyMenu
                                label="Add strategy"
                                projectId={projectId}
                                featureId={featureId}
                                environmentId={env.name}
                                variant="text"
                            />
                            <FeatureStrategyIcons
                                strategies={featureEnvironment?.strategies}
                            />
                        </div>
                    </div>

                    <FeatureOverviewEnvironmentMetrics
                        environmentMetric={environmentMetric}
                        disabled={!env.enabled}
                    />
                </AccordionSummary>

                <AccordionDetails
                    className={classNames(styles.accordionDetails, {
                        [styles.accordionDetailsDisabled]: !env.enabled,
                    })}
                >
                    <EnvironmentAccordionBody
                        featureEnvironment={featureEnvironment}
                        isDisabled={!env.enabled}
                        otherEnvironments={feature?.environments
                            .map(({ name }) => name)
                            .filter(name => name !== env.name)}
                    />
                    <ConditionallyRender
                        condition={
                            (featureEnvironment?.strategies?.length || 0) > 0
                        }
                        show={
                            <>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        py: 1,
                                    }}
                                >
                                    <FeatureStrategyMenu
                                        label="Add strategy"
                                        projectId={projectId}
                                        featureId={featureId}
                                        environmentId={env.name}
                                    />
                                </Box>
                                <EnvironmentFooter
                                    environmentMetric={environmentMetric}
                                />
                            </>
                        }
                    />
                </AccordionDetails>
            </Accordion>
        </div>
    );
};

export default FeatureOverviewEnvironment;
