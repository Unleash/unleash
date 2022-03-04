import { Grid } from '@material-ui/core';
import { UPDATE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import PageContent from 'component/common/PageContent/PageContent';
import useStrategies from 'component/../hooks/api/getters/useStrategies/useStrategies';
import { useHistory, useParams } from 'react-router-dom';
import { useFeatures } from 'hooks/api/getters/useFeatures/useFeatures';
import useApplications from 'hooks/api/getters/useApplications/useApplications';
import { StrategyDetails } from './StrategyDetails/StrategyDetails';
import HeaderTitle from 'component/common/HeaderTitle';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { Edit } from '@material-ui/icons';
import ConditionallyRender from 'component/common/ConditionallyRender';

export const StrategyView = () => {
    const { name } = useParams<{ name: string }>();
    const { strategies } = useStrategies();
    const { features } = useFeatures();
    const { applications } = useApplications();
    const history = useHistory();

    const toggles = features.filter(toggle => {
        return toggle?.strategies?.find(strategy => strategy.name === name);
    });

    const strategy = strategies.find(strategy => strategy.name === name);

    const handleEdit = () => {
        history.push(`/strategies/${name}/edit`);
    };

    if (!strategy) return null;
    return (
        <PageContent
            headerContent={
                <HeaderTitle
                    title={strategy?.name}
                    subtitle={strategy?.description}
                    actions={
                        <ConditionallyRender
                            condition={strategy.editable}
                            show={
                                <PermissionIconButton
                                    permission={UPDATE_STRATEGY}
                                    tooltip={'Edit strategy'}
                                    data-loading
                                    onClick={handleEdit}
                                >
                                    <Edit titleAccess="Edit strategy" />
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
