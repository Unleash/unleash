import { useContext } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { StrategyForm } from '../StrategyForm/StrategyForm';
import { UPDATE_STRATEGY } from '../../providers/AccessProvider/permissions';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import TabNav from '../../common/TabNav/TabNav';
import PageContent from '../../common/PageContent/PageContent';
import AccessContext from '../../../contexts/AccessContext';
import useStrategies from '../../../hooks/api/getters/useStrategies/useStrategies';
import { useParams } from 'react-router-dom';
import { useFeatures } from '../../../hooks/api/getters/useFeatures/useFeatures';
import useApplications from '../../../hooks/api/getters/useApplications/useApplications';
import { StrategyDetails } from './StrategyDetails/StrategyDetails';

export const StrategyView = () => {
    const { hasAccess } = useContext(AccessContext);
    const { strategyName } = useParams<{ strategyName: string }>();
    const { strategies } = useStrategies();
    const { features } = useFeatures();
    const { applications } = useApplications();

    const toggles = features.filter(toggle => {
        return toggle?.strategies?.find(s => s.name === strategyName);
    });

    const strategy = strategies.find(n => n.name === strategyName);

    const tabData = [
        {
            label: 'Details',
            component: (
                <StrategyDetails
                    strategy={strategy}
                    toggles={toggles}
                    applications={applications}
                />
            ),
        },
        {
            label: 'Edit',
            component: <StrategyForm strategy={strategy} editMode />,
        },
    ];

    if (!strategy) return null;
    return (
        <PageContent headerContent={strategy.name}>
            <Grid container>
                <Grid item xs={12} sm={12}>
                    <Typography variant="subtitle1">
                        {strategy.description}
                    </Typography>
                    <ConditionallyRender
                        condition={
                            strategy.editable && hasAccess(UPDATE_STRATEGY)
                        }
                        show={
                            <div>
                                <TabNav tabData={tabData} />
                            </div>
                        }
                        elseShow={
                            <section>
                                <div className="content">
                                    <StrategyDetails
                                        strategy={strategy}
                                        toggles={toggles}
                                        applications={applications}
                                    />
                                </div>
                            </section>
                        }
                    />
                </Grid>
            </Grid>
        </PageContent>
    );
};
