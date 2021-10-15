import { useParams } from 'react-router';
import useFeature from '../../../../hooks/api/getters/useFeature/useFeature';
import MetricComponent from '../../view/metric-container';
import { useStyles } from './FeatureMetrics.styles';
import { IFeatureViewParams } from '../../../../interfaces/params';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import ConditionallyRender from '../../../common/ConditionallyRender';
import EnvironmentMetricComponent from '../EnvironmentMetricComponent/EnvironmentMetricComponent';

const FeatureMetrics = () => {
    const styles = useStyles();
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);
    const { uiConfig } = useUiConfig();
    const isEnterprise = uiConfig.flags.E;

    return (
        <div className={styles.container}>
            <ConditionallyRender condition={isEnterprise}
                                 show={<EnvironmentMetricComponent />}
                                 elseShow={<MetricComponent featureToggle={feature} />}
            />
        </div>
    );
};

export default FeatureMetrics;
