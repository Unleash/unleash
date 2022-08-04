import { Tab, Tabs, useMediaQuery } from '@mui/material';
import React, { useState } from 'react';
import { Archive, FileCopy, Label, WatchLater } from '@mui/icons-material';
import {
    Link,
    Route,
    useNavigate,
    Routes,
    useLocation,
} from 'react-router-dom';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useProject from 'hooks/api/getters/useProject/useProject';
import {
    CREATE_FEATURE,
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import FeatureLog from './FeatureLog/FeatureLog';
import FeatureOverview from './FeatureOverview/FeatureOverview';
import FeatureVariants from './FeatureVariants/FeatureVariants';
import { FeatureMetrics } from './FeatureMetrics/FeatureMetrics';
import { useStyles } from './FeatureView.styles';
import { FeatureSettings } from './FeatureSettings/FeatureSettings';
import useLoading from 'hooks/useLoading';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeatureStaleDialog } from 'component/common/FeatureStaleDialog/FeatureStaleDialog';
import AddTagDialog from './FeatureOverview/AddTagDialog/AddTagDialog';
import StatusChip from 'component/common/StatusChip/StatusChip';
import { FeatureNotFound } from 'component/feature/FeatureView/FeatureNotFound/FeatureNotFound';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { FeatureArchiveDialog } from '../../common/FeatureArchiveDialog/FeatureArchiveDialog';

export const FeatureView = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { refetch: projectRefetch } = useProject(projectId);
    const { refetchFeature } = useFeature(projectId, featureId);

    const [openTagDialog, setOpenTagDialog] = useState(false);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [openStaleDialog, setOpenStaleDialog] = useState(false);
    const smallScreen = useMediaQuery(`(max-width:${500}px)`);

    const { feature, loading, error, status } = useFeature(
        projectId,
        featureId
    );

    const { classes: styles } = useStyles();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const ref = useLoading(loading);

    const basePath = `/projects/${projectId}/features/${featureId}`;

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

    const activeTab = tabData.find(tab => tab.path === pathname) ?? tabData[0];

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
                                <h1
                                    className={styles.featureViewHeader}
                                    data-loading
                                >
                                    {feature.name}{' '}
                                </h1>
                                <ConditionallyRender
                                    condition={!smallScreen}
                                    show={<StatusChip stale={feature?.stale} />}
                                />
                            </div>

                            <div className={styles.toolbarContainer}>
                                <PermissionIconButton
                                    permission={CREATE_FEATURE}
                                    projectId={projectId}
                                    data-loading
                                    component={Link}
                                    to={`/projects/${projectId}/features/${featureId}/strategies/copy`}
                                    tooltipProps={{
                                        title: 'Copy feature toggle',
                                    }}
                                >
                                    <FileCopy />
                                </PermissionIconButton>
                                <PermissionIconButton
                                    permission={DELETE_FEATURE}
                                    projectId={projectId}
                                    tooltipProps={{
                                        title: 'Archive feature toggle',
                                    }}
                                    data-loading
                                    onClick={() => setShowDelDialog(true)}
                                >
                                    <Archive />
                                </PermissionIconButton>
                                <PermissionIconButton
                                    onClick={() => setOpenStaleDialog(true)}
                                    permission={UPDATE_FEATURE}
                                    projectId={projectId}
                                    tooltipProps={{
                                        title: 'Toggle stale state',
                                    }}
                                    data-loading
                                >
                                    <WatchLater />
                                </PermissionIconButton>
                                <PermissionIconButton
                                    onClick={() => setOpenTagDialog(true)}
                                    permission={UPDATE_FEATURE}
                                    projectId={projectId}
                                    tooltipProps={{ title: 'Add tag' }}
                                    data-loading
                                >
                                    <Label />
                                </PermissionIconButton>
                            </div>
                        </div>
                        <div className={styles.separator} />
                        <div className={styles.tabContainer}>
                            <Tabs
                                value={activeTab.path}
                                indicatorColor="primary"
                                textColor="primary"
                            >
                                {tabData.map(tab => (
                                    <Tab
                                        key={tab.title}
                                        label={tab.title}
                                        value={tab.path}
                                        onClick={() => navigate(tab.path)}
                                        className={styles.tabButton}
                                    />
                                ))}
                            </Tabs>
                        </div>
                    </div>
                    <Routes>
                        <Route path="metrics" element={<FeatureMetrics />} />
                        <Route path="logs" element={<FeatureLog />} />
                        <Route path="variants" element={<FeatureVariants />} />
                        <Route path="settings" element={<FeatureSettings />} />
                        <Route path="*" element={<FeatureOverview />} />
                    </Routes>
                    <FeatureArchiveDialog
                        isOpen={showDelDialog}
                        onConfirm={() => {
                            projectRefetch();
                            navigate(`/projects/${projectId}`);
                        }}
                        onClose={() => setShowDelDialog(false)}
                        projectId={projectId}
                        featureId={featureId}
                    />
                    <FeatureStaleDialog
                        isStale={feature.stale}
                        isOpen={openStaleDialog}
                        onClose={() => {
                            setOpenStaleDialog(false);
                            refetchFeature();
                        }}
                        featureId={featureId}
                        projectId={projectId}
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
