import { type FC, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import useLoading from 'hooks/useLoading';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import IosShare from '@mui/icons-material/IosShare';
import { FlagCreationButton } from './FlagCreationButton/FlagCreationButton.tsx';
import { ImportButton } from './ImportButton/ImportButton.tsx';

type ProjectFeatureTogglesHeaderProps = {
    isLoading?: boolean;
    totalItems?: number;
    environmentsToExport?: string[];
};

export const ProjectFeatureTogglesHeader: FC<
    ProjectFeatureTogglesHeaderProps
> = ({ isLoading, totalItems, environmentsToExport }) => {
    const projectId = useRequiredPathParam('projectId');
    const headerLoadingRef = useLoading(isLoading || false);
    const [showExportDialog, setShowExportDialog] = useState(false);

    return (
        <Box ref={headerLoadingRef} aria-busy={isLoading} aria-live='polite'>
            <PageHeader
                titleElement={`Feature flags ${
                    totalItems !== undefined ? `(${totalItems})` : ''
                }`}
                actions={
                    <>
                        <Tooltip title='Export all project flags' arrow>
                            <IconButton
                                data-loading
                                onClick={() => setShowExportDialog(true)}
                            >
                                <IosShare />
                            </IconButton>
                        </Tooltip>
                        <ImportButton />

                        {!isLoading ? (
                            <ExportDialog
                                showExportDialog={showExportDialog}
                                project={projectId}
                                data={[]}
                                onClose={() => setShowExportDialog(false)}
                                environments={environmentsToExport || []}
                            />
                        ) : null}
                        <Box>
                            <FlagCreationButton isLoading={isLoading} />
                        </Box>
                    </>
                }
            />
        </Box>
    );
};
