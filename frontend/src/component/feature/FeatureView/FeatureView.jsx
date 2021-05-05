import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
    Paper,
    Typography,
    Button,
    Switch,
    LinearProgress,
} from '@material-ui/core';

import HistoryComponent from '../../history/FeatureEventHistory';
import MetricComponent from '../view/metric-container';
import UpdateStrategies from '../view/update-strategies-container';
import EditVariants from '../variant/update-variant-container';
import FeatureTypeSelect from '../feature-type-select-container';
import ProjectSelect from '../project-select-container';
import UpdateDescriptionComponent from '../view/update-description-component';
import {
    CREATE_FEATURE,
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from '../../AccessProvider/permissions';
import StatusComponent from '../status-component';
import FeatureTagComponent from '../feature-tag-component';
import StatusUpdateComponent from '../view/status-update-component';
import AddTagDialog from '../add-tag-dialog-container';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import TabNav from '../../common/TabNav';

import { scrollToTop } from '../../common/util';

import styles from './FeatureView.module.scss';
import ConfirmDialogue from '../../common/Dialogue';

import { useCommonStyles } from '../../../common.styles';
import AccessContext from '../../../contexts/AccessContext';
import { projectFilterGenerator } from '../../../utils/project-filter-generator';

const FeatureView = ({
    activeTab,
    featureToggleName,
    features,
    toggleFeature,
    setStale,
    removeFeatureToggle,
    revive,
    fetchArchive,
    fetchFeatureToggles,
    editFeatureToggle,
    featureToggle,
    history,
    untagFeature,
    featureTags,
    fetchTags,
    tagTypes,
    user,
}) => {
    const isFeatureView = !!fetchFeatureToggles;
    const [delDialog, setDelDialog] = useState(false);
    const commonStyles = useCommonStyles();
    const { hasAccess } = useContext(AccessContext);
    const { project } = featureToggle || {};

    useEffect(() => {
        scrollToTop();
        fetchTags(featureToggleName);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useLayoutEffect(() => {
        if (features.length === 0) {
            if (isFeatureView) {
                fetchFeatureToggles();
            } else {
                fetchArchive();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const editable = isFeatureView && hasAccess(UPDATE_FEATURE, project);

    const getTabComponent = key => {
        switch (key) {
            case 'activation':
                return (
                    <UpdateStrategies
                        featureToggle={featureToggle}
                        features={features}
                        history={history}
                        editable={editable}
                    />
                );
            case 'metrics':
                return <MetricComponent featureToggle={featureToggle} />;
            case 'variants':
                return (
                    <EditVariants
                        featureToggle={featureToggle}
                        features={features}
                        history={history}
                        editable={editable}
                    />
                );
            case 'log':
                return <HistoryComponent toggleName={featureToggleName} />;
            default:
                return null;
        }
    };

    const getTabData = () => {
        const path = !!isFeatureView ? 'features' : 'archive';
        return [
            {
                label: 'Activation',
                component: getTabComponent('activation'),
                name: 'strategies',
                path: `/${path}/strategies/${featureToggleName}`,
            },
            {
                label: 'Metrics',
                component: getTabComponent('metrics'),
                name: 'metrics',
                path: `/${path}/metrics/${featureToggleName}`,
            },
            {
                label: 'Variants',
                component: getTabComponent('variants'),
                name: 'variants',
                path: `/${path}/variants/${featureToggleName}`,
            },
            {
                label: 'Log',
                component: getTabComponent('log'),
                name: 'logs',
                path: `/${path}/logs/${featureToggleName}`,
            },
        ];
    };

    if (!featureToggle) {
        if (features.length === 0) {
            return <LinearProgress />;
        }
        return (
            <span>
                Could not find the toggle{' '}
                <ConditionallyRender
                    condition={editable}
                    show={
                        <Link
                            to={{
                                pathname: '/features/create',
                                query: { name: featureToggleName },
                            }}
                        >
                            {featureToggleName}
                        </Link>
                    }
                    elseShow={<span>featureToggleName</span>}
                />
            </span>
        );
    }

    const removeToggle = () => {
        removeFeatureToggle(featureToggle.name);
        history.push('/features');
    };
    const reviveToggle = () => {
        revive(featureToggle.name);
        history.push('/features');
    };
    const updateDescription = description => {
        let feature = { ...featureToggle, description };
        if (Array.isArray(feature.strategies)) {
            feature.strategies.forEach(s => {
                delete s.id;
            });
        }

        editFeatureToggle(feature);
    };
    const updateType = evt => {
        evt.preventDefault();
        const type = evt.target.value;
        let feature = { ...featureToggle, type };
        if (Array.isArray(feature.strategies)) {
            feature.strategies.forEach(s => {
                delete s.id;
            });
        }

        editFeatureToggle(feature);
    };

    const updateProject = evt => {
        evt.preventDefault();
        const project = evt.target.value;
        let feature = { ...featureToggle, project };
        if (Array.isArray(feature.strategies)) {
            feature.strategies.forEach(s => {
                delete s.id;
            });
        }

        editFeatureToggle(feature);
    };

    const updateStale = stale => {
        setStale(stale, featureToggleName);
    };

    const tabs = getTabData();

    const findActiveTab = activeTab =>
        tabs.findIndex(tab => tab.name === activeTab);

    return (
        <Paper
            className={commonStyles.fullwidth}
            style={{ overflow: 'visible' }}
        >
            <div>
                <div className={styles.header}>
                    <Typography variant="h1" className={styles.heading}>
                        {featureToggle.name}
                    </Typography>
                    <StatusComponent stale={featureToggle.stale} />
                </div>
                <div
                    className={classnames(
                        styles.featureInfoContainer,
                        commonStyles.contentSpacingY
                    )}
                >
                    <UpdateDescriptionComponent
                        isFeatureView={isFeatureView}
                        description={featureToggle.description}
                        update={updateDescription}
                        editable={editable}
                    />
                    <div className={styles.selectContainer}>
                        <FeatureTypeSelect
                            value={featureToggle.type}
                            onChange={updateType}
                            label="Feature type"
                            editable={editable}
                        />
                        &nbsp;
                        <ProjectSelect
                            value={featureToggle.project}
                            onChange={updateProject}
                            label="Project"
                            filled
                            editable={editable}
                            filter={projectFilterGenerator(
                                user,
                                CREATE_FEATURE
                            )}
                        />
                    </div>
                    <FeatureTagComponent
                        featureToggleName={featureToggle.name}
                        tags={featureTags}
                        tagTypes={tagTypes}
                        untagFeature={untagFeature}
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <span style={{ paddingRight: '24px' }}>
                    <ConditionallyRender
                        condition={editable}
                        show={
                            <>
                                <Switch
                                    disabled={!isFeatureView}
                                    checked={featureToggle.enabled}
                                    onChange={() =>
                                        toggleFeature(
                                            !featureToggle.enabled,
                                            featureToggle.name
                                        )
                                    }
                                />
                                <span>
                                    {featureToggle.enabled
                                        ? 'Enabled'
                                        : 'Disabled'}
                                </span>
                            </>
                        }
                        elseShow={
                            <>
                                <Switch
                                    disabled
                                    checked={featureToggle.enabled}
                                />
                                <span>
                                    {featureToggle.enabled
                                        ? 'Enabled'
                                        : 'Disabled'}
                                </span>
                            </>
                        }
                    />
                </span>

                <ConditionallyRender
                    condition={isFeatureView}
                    show={
                        <div>
                            <AddTagDialog
                                featureToggleName={featureToggle.name}
                            />
                            <StatusUpdateComponent
                                stale={featureToggle.stale}
                                updateStale={updateStale}
                            />
                            <Button
                                title="Create new feature toggle by cloning configuration"
                                component={Link}
                                to={`/features/copy/${featureToggle.name}`}
                            >
                                Clone
                            </Button>

                            <Button
                                disabled={!hasAccess(DELETE_FEATURE, project)}
                                onClick={() => {
                                    setDelDialog(true);
                                }}
                                title="Archive feature toggle"
                                style={{ flexShrink: 0 }}
                            >
                                Archive
                            </Button>
                        </div>
                    }
                    elseShow={
                        <Button
                            disabled={!hasAccess(UPDATE_FEATURE, hasAccess)}
                            onClick={reviveToggle}
                            style={{ flexShrink: 0 }}
                        >
                            Revive
                        </Button>
                    }
                />
            </div>

            <hr />

            <TabNav
                tabData={tabs}
                className={styles.tabContentContainer}
                startingTab={findActiveTab(activeTab)}
            />
            <ConfirmDialogue
                open={delDialog}
                title="Are you sure you want to archive this toggle"
                onClick={() => {
                    setDelDialog(false);
                    removeToggle();
                }}
            />
        </Paper>
    );
};

FeatureView.propTypes = {
    activeTab: PropTypes.string.isRequired,
    featureToggleName: PropTypes.string.isRequired,
    features: PropTypes.array.isRequired,
    toggleFeature: PropTypes.func,
    setStale: PropTypes.func,
    removeFeatureToggle: PropTypes.func,
    revive: PropTypes.func,
    fetchArchive: PropTypes.func,
    fetchFeatureToggles: PropTypes.func,
    fetchFeatureToggle: PropTypes.func,
    editFeatureToggle: PropTypes.func,
    featureToggle: PropTypes.object,
    history: PropTypes.object.isRequired,
    fetchTags: PropTypes.func,
    untagFeature: PropTypes.func,
    featureTags: PropTypes.array,
    tagTypes: PropTypes.array,
};

export default FeatureView;
