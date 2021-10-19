import { Tab, Tabs } from '@material-ui/core';
import { useState } from 'react';
import { Archive, FileCopy } from '@material-ui/icons';
import { Link, Route, useHistory, useParams } from 'react-router-dom';
import useFeatureApi from '../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import useFeature from '../../../hooks/api/getters/useFeature/useFeature';
import useProject from '../../../hooks/api/getters/useProject/useProject';
import useTabs from '../../../hooks/useTabs';
import useToast from '../../../hooks/useToast';
import { IFeatureViewParams } from '../../../interfaces/params';
import { UPDATE_FEATURE } from '../../providers/AccessProvider/permissions';
import Dialogue from '../../common/Dialogue';
import PermissionIconButton from '../../common/PermissionIconButton/PermissionIconButton';
import FeatureLog from './FeatureLog/FeatureLog';
import FeatureMetrics from './FeatureMetrics/FeatureMetrics';
import FeatureOverview from './FeatureOverview/FeatureOverview';
import FeatureStrategies from './FeatureStrategies/FeatureStrategies';
import FeatureVariants from './FeatureVariants/FeatureVariants';
import { useStyles } from './FeatureView2.styles';
import FeatureSettings from './FeatureSettings/FeatureSettings';
import useLoading from '../../../hooks/useLoading';
import ConditionallyRender from '../../common/ConditionallyRender';
import { getCreateTogglePath } from '../../../utils/route-path-helpers';

const FeatureView2 = () => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature, loading, error } = useFeature(projectId, featureId);
    const { refetch: projectRefetch } = useProject(projectId);
    const { a11yProps } = useTabs(0);
    const { archiveFeatureToggle } = useFeatureApi();
    const { toast, setToastData } = useToast();
    const [showDelDialog, setShowDelDialog] = useState(false);
    const styles = useStyles();
    const history = useHistory();
    const ref = useLoading(loading);

    const basePath = `/projects/${projectId}/features2/${featureId}`;

    const archiveToggle = async () => {
        try {
            await archiveFeatureToggle(projectId, featureId);
            setToastData({
                text: 'Feature archived',
                type: 'success',
                show: true,
            });
            setShowDelDialog(false);
            projectRefetch();
            history.push(`/projects/${projectId}`);
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
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
            title: 'Strategies',
            path: `${basePath}/strategies`,
            name: 'strategies',
        },
        {
            title: 'Metrics',
            path: `${basePath}/metrics`,
            name: 'Metrics',
        },
        {
            title: 'Event log',
            path: `${basePath}/logs`,
            name: 'Event log',
        },
        { title: 'Variants', path: `${basePath}/variants`, name: 'Variants' },
        { title: 'Settings', path: `${basePath}/settings`, name: 'Settings' },
    ];

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

    const renderFeatureNotExist = () => {
        return (
            <div>
                <p>
                    The feature <strong>{featureId.substring(0, 30)}</strong>{' '}
                    does not exist. Do you want to &nbsp;
                    <Link to={getCreateTogglePath(projectId)}>create it</Link>
                    &nbsp;?
                </p>
            </div>
        );
    };

    return (
        <ConditionallyRender
            condition={error === undefined}
            show={
                <div ref={ref}>
                    <div className={styles.header}>
                        <div className={styles.innerContainer}>
                            <h2
                                className={styles.featureViewHeader}
                                data-loading
                            >
                                {feature.name}
                            </h2>
                            <div className={styles.actions}>
                                <PermissionIconButton
                                    permission={UPDATE_FEATURE}
                                    tooltip="Copy"
                                    data-loading
                                    component={Link}
                                    to={`/projects/${projectId}/features2/${featureId}/strategies/copy`}
                                >
                                    <FileCopy />
                                </PermissionIconButton>
                                <PermissionIconButton
                                    permission={UPDATE_FEATURE}
                                    tooltip="Archive feature toggle"
                                    data-loading
                                    onClick={() => setShowDelDialog(true)}
                                >
                                    <Archive />
                                </PermissionIconButton>
                            </div>
                        </div>
                        <div className={styles.separator} />
                        <div className={styles.tabContainer}>
                            <Tabs
                                value={history.location.pathname}
                                indicatorColor="primary"
                                textColor="primary"
                                className={styles.tabNavigation}
                            >
                                {renderTabs()}
                            </Tabs>
                        </div>
                    </div>
                    <Route
                        exact
                        path={`/projects/:projectId/features2/:featureId`}
                        component={FeatureOverview}
                    />
                    <Route
                        path={`/projects/:projectId/features2/:featureId/strategies`}
                        component={FeatureStrategies}
                    />
                    <Route
                        path={`/projects/:projectId/features2/:featureId/metrics`}
                        component={FeatureMetrics}
                    />
                    <Route
                        path={`/projects/:projectId/features2/:featureId/logs`}
                        component={FeatureLog}
                    />
                    <Route
                        path={`/projects/:projectId/features2/:featureId/variants`}
                        component={FeatureVariants}
                    />
                    <Route
                        path={`/projects/:projectId/features2/:featureId/settings`}
                        component={FeatureSettings}
                    />
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
                    {toast}
                </div>
            }
            elseShow={renderFeatureNotExist()}
        />
    );
};

export default FeatureView2;
