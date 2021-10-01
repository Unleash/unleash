import { useStyles } from './FeatureVariants.styles';
import { useHistory, useParams } from 'react-router';
import useFeature from '../../../../hooks/api/getters/useFeature/useFeature';
import { IFeatureViewParams } from '../../../../interfaces/params';
import EditVariants from '../../variant/update-variant-container';

const FeatureVariants = () => {
    const styles = useStyles();
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);
    const history = useHistory();

    return (
        <div className={styles.container}>
            <EditVariants featureToggle={feature} history={history} editable />
        </div>
    );
};

export default FeatureVariants;
