import { type FC, useMemo, useState } from 'react';
import { Button } from '@mui/material';
import type { FeatureSchema } from 'openapi';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import { ArchiveButton } from './ArchiveButton.tsx';
import { MoreActions } from './MoreActions.tsx';
import { ManageTags } from './ManageTags.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { BulkDisableDialog } from 'component/feature/FeatureToggleList/BulkDisableDialog';
import { BulkEnableDialog } from 'component/feature/FeatureToggleList/BulkEnableDialog';
interface IProjectFeaturesBatchActionsProps {
    selectedIds: string[];
    data: FeatureSchema[];
    projectId: string;
    onResetSelection: () => void;
    onChange?: () => void;
}

export const ProjectFeaturesBatchActions: FC<
    IProjectFeaturesBatchActionsProps
> = ({ selectedIds, data, projectId, onResetSelection, onChange }) => {
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showBulkEnableDialog, setShowBulkEnableDialog] = useState(false);
    const [showBulkDisableDialog, setShowBulkDisableDialog] = useState(false);
    const { trackEvent } = usePlausibleTracker();
    const selectedData = useMemo(
        () => data.filter((d) => selectedIds.includes(d.name)),
        [data, selectedIds],
    );

    const environments = useMemo(() => {
        const envs = selectedData
            .flatMap((d) => d.environments)
            .map((env) => env?.name)
            .filter((env) => env !== undefined) as string[];
        return Array.from(new Set(envs));
    }, [selectedData]);

    const confirmExport = () => {
        onChange?.();
        trackEvent('batch_operations', {
            props: {
                eventType: 'features exported',
            },
        });
    };
    const confirmBulkEnabled = () => {
        onChange?.();
        trackEvent('batch_operations', {
            props: {
                eventType: 'features enabled',
            },
        });
    };
    const confirmBulkDisabled = () => {
        onChange?.();
        trackEvent('batch_operations', {
            props: {
                eventType: 'features disabled',
            },
        });
    };

    const confirmArchive = () => {
        onChange?.();
        onResetSelection();
    };

    return (
        <>
            <Button
                variant='outlined'
                size='small'
                onClick={() => setShowBulkEnableDialog(true)}
            >
                Enable
            </Button>
            <Button
                variant='outlined'
                size='small'
                onClick={() => setShowBulkDisableDialog(true)}
            >
                Disable
            </Button>
            <ArchiveButton
                projectId={projectId}
                featureIds={selectedIds}
                features={data}
                onConfirm={confirmArchive}
            />
            <Button
                variant='outlined'
                size='small'
                onClick={() => setShowExportDialog(true)}
            >
                Export
            </Button>
            <ManageTags
                projectId={projectId}
                data={selectedData}
                onChange={onChange}
            />
            <MoreActions
                projectId={projectId}
                data={selectedData}
                onChange={onChange}
            />
            <ExportDialog
                showExportDialog={showExportDialog}
                data={selectedData}
                onClose={() => setShowExportDialog(false)}
                environments={environments}
                onConfirm={confirmExport}
            />
            <BulkEnableDialog
                showExportDialog={showBulkEnableDialog}
                data={selectedData}
                onClose={() => setShowBulkEnableDialog(false)}
                environments={environments}
                projectId={projectId}
                onConfirm={confirmBulkEnabled}
            />
            <BulkDisableDialog
                showExportDialog={showBulkDisableDialog}
                data={selectedData}
                onClose={() => setShowBulkDisableDialog(false)}
                environments={environments}
                projectId={projectId}
                onConfirm={confirmBulkDisabled}
            />
        </>
    );
};
