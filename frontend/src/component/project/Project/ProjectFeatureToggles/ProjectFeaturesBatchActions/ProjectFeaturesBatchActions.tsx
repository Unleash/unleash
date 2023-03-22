import { FC, useMemo, useState } from 'react';
import { Button } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import type { FeatureSchema } from 'openapi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import { ArchiveButton } from './ArchiveButton';
import { MoreActions } from './MoreActions';
import { ManageTags } from './ManageTags';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

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

    return (
        <>
            <ArchiveButton projectId={projectId} features={selectedIds} />
            <Button
                startIcon={<FileDownload />}
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
        </>
    );
};
