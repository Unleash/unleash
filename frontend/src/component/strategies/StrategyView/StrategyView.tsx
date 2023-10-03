import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UPDATE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { useFeatures } from 'hooks/api/getters/useFeatures/useFeatures';
import useApplications from 'hooks/api/getters/useApplications/useApplications';
import { StrategyDetails } from './StrategyDetails/StrategyDetails';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { Edit } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { FeatureSchema } from 'openapi/models';

export const StrategyView = () => {
    const name = useRequiredPathParam('name');
    const { strategies } = useStrategies();
    const { features = [] } = useFeatures();
    const { applications } = useApplications();
    const navigate = useNavigate();

    // Has been broken since the migration to environments. We need to create an
    // endpoint that returns all environments and strategies for all features to make this
    // work properly OR alternatively create an endpoint that abstracts this logic into the backend
    const toggles = features.filter((toggle: FeatureSchema) => {
        return toggle?.environments
            ?.flatMap(env => env.strategies)
            .some(strategy => strategy && strategy.name === name);
    });

    const strategy = strategies.find(strategy => strategy.name === name);

    const handleEdit = () => {
        navigate(`/strategies/${name}/edit`);
    };

    if (!strategy) return null;
    return (
        <PageContent
            header={
                <PageHeader
                    title={strategy?.name}
                    subtitle={strategy?.description}
                    actions={
                        <ConditionallyRender
                            condition={strategy.editable}
                            show={
                                <PermissionIconButton
                                    permission={UPDATE_STRATEGY}
                                    data-loading
                                    onClick={handleEdit}
                                    tooltipProps={{ title: 'Edit strategy' }}
                                >
                                    <Edit />
                                </PermissionIconButton>
                            }
                        />
                    }
                />
            }
        >
            <Grid container>
                <Grid item xs={12} sm={12}>
                    <StrategyDetails
                        strategy={strategy}
                        toggles={toggles}
                        applications={applications}
                    />
                </Grid>
            </Grid>
        </PageContent>
    );
};
