import { Tab, Tabs, useMediaQuery } from '@material-ui/core';
import React, { useState } from 'react';
import { Archive, FileCopy, Label, WatchLater } from '@material-ui/icons';
import { Link, Route, useHistory, useParams, Switch } from 'react-router-dom';
import useFeatureApi from '../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useProject from '../../../hooks/api/getters/useProject/useProject';
import useTabs from '../../../hooks/useTabs';
import useToast from '../../../hooks/useToast';
import { IFeatureViewParams } from 'interfaces/params';
import {
    CREATE_FEATURE,
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from '../../providers/AccessProvider/permissions';
import Dialogue from '../../common/Dialogue';
import PermissionIconButton from '../../common/PermissionIconButton/PermissionIconButton';
import FeatureLog from './FeatureLog/FeatureLog';
import FeatureOverview from './FeatureOverview/FeatureOverview';
import FeatureVariants from './FeatureVariants/FeatureVariants';
import { FeatureMetrics } from './FeatureMetrics/FeatureMetrics';
import { useStyles } from './FeatureView.styles';
import { FeatureSettings } from './FeatureSettings/FeatureSettings';
import useLoading from '../../../hooks/useLoading';
import ConditionallyRender from '../../common/ConditionallyRender';
import StaleDialog from './FeatureOverview/StaleDialog/StaleDialog';
import AddTagDialog from './FeatureOverview/AddTagDialog/AddTagDialog';
import StatusChip from '../../common/StatusChip/StatusChip';
import { formatUnknownError } from 'utils/format-unknown-error';
import { FeatureNotFound } from 'component/feature/FeatureView/FeatureNotFound/FeatureNotFound';

export const FeatureView = () => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { refetch: projectRefetch } = useProject(projectId);
    const [openTagDialog, setOpenTagDialog] = useState(false);
    const { a11yProps } = useTabs(0);
    const { archiveFeatureToggle } = useFeatureApi();
    const { setToastData, setToastApiError } = useToast();
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [openStaleDialog, setOpenStaleDialog] = useState(false);
    const smallScreen = useMediaQuery(`(max-width:${500}px)`);

    const { feature, loading, error, status } = useFeature(
        projectId,
        featureId
    );

    const styles = useStyles();
    const history = useHistory();
    const ref = useLoading(loading);

    const basePath = `/projects/${projectId}/features/${featureId}`;

    const archiveToggle = async () => {
        try {
            await archiveFeatureToggle(projectId, featureId);
            setToastData({
                text: 'Your feature toggle has been archived',
                type: 'success',
                title: 'Feature archived',
            });
            setShowDelDialog(false);
            projectRefetch();
            history.push(`/projects/${projectId}`);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
            setShowDelDialog(false);
        }
    };

    const handleCancel = () => setShowDelDialog(false);

    const tabData = [
        {
            title: 'Overview',
            path: `${basePath}`,
            name: 'overview',
        },
        {
            title: 'Metrics',
            path: `${basePath}/metrics`,
            name: 'Metrics',
        },
        { title: 'Variants', path: `${basePath}/variants`, name: 'Variants' },
        { title: 'Settings', path: `${basePath}/settings`, name: 'Settings' },
        {
            title: 'Event log',
            path: `${basePath}/logs`,
            name: 'Event log',
        },
    ];

    const activeTab =
        tabData.find(tab => tab.path === history.location.pathname) ??
        tabData[0];

    const renderTabs = () => {
        return tabData.map((tab, index) => {
            return (
                <Tab
                    data-loading
                    key={tab.title}
                    label={tab.title}
                    value={tab.path}
                    {...a11yProps(index)}
                    onClick={() => {
                        history.push(tab.path);
                    }}
                    className={styles.tabButton}
                />
            );
        });
    };

    if (status === 404) {
        return <FeatureNotFound />;
    }

    return (
        <ConditionallyRender
            condition={error === undefined}
            show={
                <div ref={ref}>
                    <div className={styles.header}>
                        <div className={styles.innerContainer}>
                            <div className={styles.toggleInfoContainer}>
                                <h2
                                    className={styles.featureViewHeader}
                                    data-loading
                                >
                                    {feature.name}{' '}
                                </h2>
                                <ConditionallyRender
                                    condition={!smallScreen}
                                    show={<StatusChip stale={feature?.stale} />}
                                />
                            </div>

                            <div className={styles.actions}>
                                <PermissionIconButton
                                    permission={CREATE_FEATURE}
                                    projectId={projectId}
                                    data-loading
                                    // @ts-expect-error
                                    component={Link}
                                    to={`/projects/${projectId}/features/${featureId}/strategies/copy`}
                                >
                                    <FileCopy titleAccess="Copy" />
                                </PermissionIconButton>
                                <PermissionIconButton
                                    permission={DELETE_FEATURE}
                                    projectId={projectId}
                                    data-loading
                                    onClick={() => setShowDelDialog(true)}
                                >
                                    <Archive titleAccess="Archive feature toggle" />
                                </PermissionIconButton>
                                <PermissionIconButton
                                    onClick={() => setOpenStaleDialog(true)}
                                    permission={UPDATE_FEATURE}
                                    projectId={projectId}
                                    data-loading
                                >
                                    <WatchLater titleAccess="Toggle stale status" />
                                </PermissionIconButton>
                                <PermissionIconButton
                                    onClick={() => setOpenTagDialog(true)}
                                    permission={UPDATE_FEATURE}
                                    projectId={projectId}
                                    data-loading
                                >
                                    <Label titleAccess="Add tag" />
                                </PermissionIconButton>
                            </div>
                        </div>
                        <div className={styles.separator} />
                        <div className={styles.tabContainer}>
                            <Tabs
                                value={activeTab.path}
                                indicatorColor="primary"
                                textColor="primary"
                                className={styles.tabNavigation}
                            >
                                {renderTabs()}
                            </Tabs>
                        </div>
                    </div>
                    <Switch>
                        <Route
                            path={`/projects/:projectId/features/:featureId/metrics`}
                            component={FeatureMetrics}
                        />
                        <Route
                            path={`/projects/:projectId/features/:featureId/logs`}
                            component={FeatureLog}
                        />
                        <Route
                            path={`/projects/:projectId/features/:featureId/variants`}
                            component={FeatureVariants}
                        />
                        <Route
                            path={`/projects/:projectId/features/:featureId/settings`}
                            component={FeatureSettings}
                        />
                        <Route
                            path={`/projects/:projectId/features/:featureId`}
                            component={FeatureOverview}
                        />
                    </Switch>
                    <Dialogue
                        onClick={() => archiveToggle()}
                        open={showDelDialog}
                        onClose={handleCancel}
                        primaryButtonText="Archive toggle"
                        secondaryButtonText="Cancel"
                        title="Archive feature toggle"
                    >
                        Are you sure you want to archive this feature toggle?
                    </Dialogue>
                    <StaleDialog
                        stale={feature.stale}
                        open={openStaleDialog}
                        setOpen={setOpenStaleDialog}
                    />
                    <AddTagDialog
                        open={openTagDialog}
                        setOpen={setOpenTagDialog}
                    />
                </div>
            }
        />
    );
};
