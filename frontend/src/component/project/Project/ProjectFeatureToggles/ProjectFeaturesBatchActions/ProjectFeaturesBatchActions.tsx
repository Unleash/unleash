import { FC, useMemo, useState } from 'react';
import { Button } from '@mui/material';
import type { FeatureSchema } from 'openapi';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import { ArchiveButton } from './ArchiveButton';
import { MoreActions } from './MoreActions';
import { ManageTags } from './ManageTags';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { BulkDisableDialog } from 'component/feature/FeatureToggleList/BulkDisableDialog';
import { BulkEnableDialog } from 'component/feature/FeatureToggleList/BulkEnableDialog';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IProjectFeaturesBatchActionsProps {
    selectedIds: string[];
    data: FeatureSchema[];
    projectId: string;
}

export const ProjectFeaturesBatchActions: FC<
    IProjectFeaturesBatchActionsProps
> = ({ selectedIds, data, projectId }) => {
    const { uiConfig } = useUiConfig();
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showBulkEnableDialog, setShowBulkEnableDialog] = useState(false);
    const [showBulkDisableDialog, setShowBulkDisableDialog] = useState(false);
    const { trackEvent } = usePlausibleTracker();
    const selectedData = useMemo(
        () => data.filter(d => selectedIds.includes(d.name)),
        [data, selectedIds]
    );

    const environments = useMemo(() => {
        const envs = selectedData
            .flatMap(d => d.environments)
            .map(env => env?.name)
            .filter(env => env !== undefined) as string[];
        return Array.from(new Set(envs));
    }, [selectedData]);

    const trackExport = () => {
        trackEvent('batch_operations', {
            props: {
                eventType: 'features exported',
            },
        });
    };
    const trackBulkEnabled = () => {
        trackEvent('batch_operations', {
            props: {
                eventType: 'features enabled',
            },
        });
    };
    const trackBulkDisabled = () => {
        trackEvent('batch_operations', {
            props: {
                eventType: 'features disabled',
            },
        });
    };

    return (
        <>
            <ConditionallyRender
                condition={Boolean(uiConfig?.flags?.disableBulkToggle)}
                show={null}
                elseShow={
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowBulkEnableDialog(true)}
                    >
                        Enable
                    </Button>
                }
            />
            <ConditionallyRender
                condition={Boolean(uiConfig?.flags?.disableBulkToggle)}
                show={null}
                elseShow={
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowBulkDisableDialog(true)}
                    >
                        Disable
                    </Button>
                }
            />
            <ArchiveButton projectId={projectId} features={selectedIds} />
            <Button
                variant="outlined"
                size="small"
                onClick={() => setShowExportDialog(true)}
            >
                Export
            </Button>
            <ManageTags projectId={projectId} data={selectedData} />
            <MoreActions projectId={projectId} data={selectedData} />
            <ExportDialog
                showExportDialog={showExportDialog}
                data={selectedData}
                onClose={() => setShowExportDialog(false)}
                environments={environments}
                onConfirm={trackExport}
            />
            <BulkEnableDialog
                showExportDialog={showBulkEnableDialog}
                data={selectedData}
                onClose={() => setShowBulkEnableDialog(false)}
                environments={environments}
                projectId={projectId}
                onConfirm={trackBulkEnabled}
            />
            <BulkDisableDialog
                showExportDialog={showBulkDisableDialog}
                data={selectedData}
                onClose={() => setShowBulkDisableDialog(false)}
                environments={environments}
                projectId={projectId}
                onConfirm={trackBulkDisabled}
            />
        </>
    );
};
