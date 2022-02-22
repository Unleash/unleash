import { useParams, useHistory, Link } from 'react-router-dom';
import { IFeatureViewParams } from 'interfaces/params';
import ConditionallyRender from 'component/common/ConditionallyRender';
import NoItemsStrategies from 'component/common/NoItems/NoItemsStrategies/NoItemsStrategies';
import FeatureOverviewEnvironmentStrategies from '../FeatureOverviewEnvironmentStrategies/FeatureOverviewEnvironmentStrategies';
import { useStyles } from '../FeatureOverviewEnvironment.styles';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';

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
    const history = useHistory();
    const { hasAccess } = useContext(AccessContext);
    const strategiesLink = `/projects/${projectId}/features/${featureId}/strategies?environment=${featureEnvironment?.name}`;

    if (!featureEnvironment) return null;

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
                            <ConditionallyRender
                                condition={hasAccess(
                                    CREATE_FEATURE_STRATEGY,
                                    projectId,
                                    featureEnvironment.name
                                )}
                                show={
                                    <div className={styles.linkContainer}>
                                        <Link to={strategiesLink}>
                                            Edit strategies
                                        </Link>
                                    </div>
                                }
                            />
                            <FeatureOverviewEnvironmentStrategies
                                strategies={featureEnvironment?.strategies}
                                environmentName={featureEnvironment.name}
                            />
                        </>
                    }
                    elseShow={
                        <NoItemsStrategies
                            envName={featureEnvironment.name}
                            onClick={() => history.push(strategiesLink)}
                            projectId={projectId}
                        />
                    }
                />
            </div>
        </div>
    );
};

export default FeatureOverviewEnvironmentBody;
