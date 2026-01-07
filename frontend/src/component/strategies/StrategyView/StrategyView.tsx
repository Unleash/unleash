import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UPDATE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import useApplications from 'hooks/api/getters/useApplications/useApplications';
import { StrategyDetails } from './StrategyDetails/StrategyDetails.tsx';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import Edit from '@mui/icons-material/Edit';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

export const StrategyView = () => {
    const name = useRequiredPathParam('name');
    const { strategies } = useStrategies();
    const { applications } = useApplications();
    const navigate = useNavigate();

    const strategy = strategies.find((strategy) => strategy.name === name);

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
                        applications={applications}
                    />
                </Grid>
            </Grid>
        </PageContent>
    );
};
