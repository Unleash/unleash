import { useParams } from 'react-router-dom';
import { IFeatureViewParams } from 'interfaces/params';
import ConditionallyRender from 'component/common/ConditionallyRender';
import FeatureOverviewEnvironmentStrategies from '../FeatureOverviewEnvironmentStrategies/FeatureOverviewEnvironmentStrategies';
import { useStyles } from '../FeatureOverviewEnvironment.styles';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { FeatureStrategyMenu } from '../../../../../FeatureStrategy/FeatureStrategyMenu/FeatureStrategyMenu';
import { FeatureStrategyEmpty } from '../../../../../FeatureStrategy/FeatureStrategyEmpty/FeatureStrategyEmpty';

interface IFeatureOverviewEnvironmentBodyProps {
    getOverviewText: () => string;
    featureEnvironment?: IFeatureEnvironment;
}

const FeatureOverviewEnvironmentBody = ({
    featureEnvironment,
    getOverviewText,
}: IFeatureOverviewEnvironmentBodyProps) => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const styles = useStyles();

    if (!featureEnvironment) {
        return null;
    }

    return (
        <div className={styles.accordionBody}>
            <div className={styles.accordionBodyInnerContainer}>
                <div className={styles.resultInfo}>
                    <div className={styles.leftWing} />
                    <div className={styles.separatorText}>
                        {getOverviewText()}
                    </div>
                    <div className={styles.rightWing} />
                </div>
                <ConditionallyRender
                    condition={featureEnvironment?.strategies.length > 0}
                    show={
                        <>
                            <div className={styles.linkContainer}>
                                <FeatureStrategyMenu
                                    label="Add strategy"
                                    projectId={projectId}
                                    featureId={featureId}
                                    environmentId={featureEnvironment.name}
                                />
                            </div>
                            <FeatureOverviewEnvironmentStrategies
                                strategies={featureEnvironment?.strategies}
                                environmentName={featureEnvironment.name}
                            />
                        </>
                    }
                    elseShow={
                        <FeatureStrategyEmpty
                            projectId={projectId}
                            featureId={featureId}
                            environmentId={featureEnvironment.name}
                        />
                    }
                />
            </div>
        </div>
    );
};
export default FeatureOverviewEnvironmentBody;
