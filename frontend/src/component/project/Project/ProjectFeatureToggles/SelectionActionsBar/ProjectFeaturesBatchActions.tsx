import { FC, useMemo, useState } from 'react';
import { Button } from '@mui/material';
import { FileDownload, Label } from '@mui/icons-material';
import type { FeatureSchema } from 'openapi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ArchiveButton } from './ArchiveButton';
import { MoreActions } from './MoreActions';

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
            <Button
                disabled
                startIcon={<Label />}
                variant="outlined"
                size="small"
            >
                Tags
            </Button>
            <MoreActions projectId={projectId} data={selectedData} />
            <ConditionallyRender
                condition={Boolean(uiConfig?.flags?.featuresExportImport)}
                show={
                    <ExportDialog
                        showExportDialog={showExportDialog}
                        data={selectedData}
                        onClose={() => setShowExportDialog(false)}
                        environments={environments}
                    />
                }
            />
        </>
    );
};
