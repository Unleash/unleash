import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import { SectionSeparator } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/SectionSeparator/SectionSeparator';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import useToast from 'hooks/useToast';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { FeatureStrategyMenu } from '../FeatureStrategyMenu/FeatureStrategyMenu';
import { PresetCard } from './PresetCard/PresetCard';
import { useStyles } from './FeatureStrategyEmpty.styles';
import { formatUnknownError } from 'utils/formatUnknownError';

interface IFeatureStrategyEmptyProps {
    projectId: string;
    featureId: string;
    environmentId: string;
}

export const FeatureStrategyEmpty = ({
    projectId,
    featureId,
    environmentId,
}: IFeatureStrategyEmptyProps) => {
    const { classes: styles } = useStyles();
    const { addStrategyToFeature } = useFeatureStrategyApi();
    const { setToastData, setToastApiError } = useToast();
    const { refetchFeature } = useFeature(projectId, featureId);

    const onAfterAddStrategy = () => {
        refetchFeature();
        setToastData({
            title: 'Strategy created',
            text: 'Successfully created strategy',
            type: 'success',
        });
    };

    const onAddSimpleStrategy = async () => {
        try {
            await addStrategyToFeature(projectId, featureId, environmentId, {
                name: 'default',
                parameters: {},
                constraints: [],
            });
            onAfterAddStrategy();
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onAddGradualRolloutStrategy = async () => {
        try {
            await addStrategyToFeature(projectId, featureId, environmentId, {
                name: 'flexibleRollout',
                parameters: {
                    rollout: '50',
                    stickiness: 'default',
                },
                constraints: [],
            });
            onAfterAddStrategy();
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                You have not defined any strategies yet.
            </div>
            <p className={styles.description}>
                Strategies added in this environment will only be executed if
                the SDK is using an{' '}
                <Link to="/admin/api">API key configured</Link> for this
                environment.
            </p>
            <FeatureStrategyMenu
                label="Add your first strategy"
                projectId={projectId}
                featureId={featureId}
                environmentId={environmentId}
            />
            <Box sx={{ width: '100%', mt: 3 }}>
                <SectionSeparator>Or use a strategy template</SectionSeparator>
            </Box>
            <Box
                sx={{
                    display: 'grid',
                    width: '100%',
                    gap: 2,
                    gridTemplateColumns: '1fr 1fr',
                }}
            >
                <PresetCard
                    title="Standard strategy"
                    onClick={onAddSimpleStrategy}
                >
                    The standard strategy is strictly on/off for your entire
                    userbase.
                </PresetCard>
                <PresetCard
                    title="Gradual rollout"
                    onClick={onAddGradualRolloutStrategy}
                >
                    Roll out to a percentage of your userbase.
                </PresetCard>
            </Box>
        </div>
    );
};
