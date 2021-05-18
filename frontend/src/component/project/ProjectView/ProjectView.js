import { useContext, useEffect } from 'react';
import { Typography, Button, List } from '@material-ui/core';
import { Link } from 'react-router-dom';
import AccessContext from '../../../contexts/AccessContext';
import HeaderTitle from '../../common/HeaderTitle';
import PageContent from '../../common/PageContent';

import FeatureToggleListItem from '../../feature/FeatureToggleList/FeatureToggleListItem';
import ConditionallyRender from '../../common/ConditionallyRender';
import ListPlaceholder from '../../common/ListPlaceholder/ListPlaceholder';

const ProjectView = ({
    project,
    features,
    settings,
    toggleFeature,
    featureMetrics,
    revive,
    fetchFeatureToggles,
}) => {
    const { hasAccess } = useContext(AccessContext);

    useEffect(() => {
        fetchFeatureToggles();
        /* eslint-disable-next-line */
    }, []);

    const renderProjectFeatures = () => {
        return features.map(feature => {
            return (
                <FeatureToggleListItem
                    key={feature.name}
                    settings={settings}
                    metricsLastHour={featureMetrics.lastHour[feature.name]}
                    metricsLastMinute={featureMetrics.lastMinute[feature.name]}
                    feature={feature}
                    toggleFeature={toggleFeature}
                    revive={revive}
                    hasAccess={hasAccess}
                />
            );
        });
    };

    return (
        <div>
            <PageContent
                headerContent={
                    <HeaderTitle
                        title={`${project.name}`}
                        actions={
                            <>
                                <Button
                                    component={Link}
                                    to={`/projects/edit/${project.id}`}
                                >
                                    Edit
                                </Button>
                                <Button
                                    component={Link}
                                    to={`/projects/${project.id}/access`}
                                >
                                    Manage access
                                </Button>
                            </>
                        }
                    />
                }
            >
                <ConditionallyRender
                    condition={project.description}
                    show={
                        <div style={{ marginBottom: '2rem' }}>
                            <Typography variant="subtitle2">
                                Description
                            </Typography>
                            <Typography>{project.description}</Typography>
                        </div>
                    }
                />

                <Typography variant="subtitle2">
                    Feature toggles in this project
                </Typography>
                <List>
                    <ConditionallyRender
                        condition={features.length > 0}
                        show={renderProjectFeatures()}
                        elseShow={
                            <ListPlaceholder
                                text="No features available. Get started by adding a
                                new feature toggle."
                            />
                        }
                    />
                </List>
            </PageContent>
        </div>
    );
};

export default ProjectView;
