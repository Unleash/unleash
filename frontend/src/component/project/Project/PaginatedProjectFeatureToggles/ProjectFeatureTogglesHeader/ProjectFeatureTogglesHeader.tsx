import { type FC, type ReactNode, useState } from 'react';
import { Box, IconButton, styled, Tooltip } from '@mui/material';
import useLoading from 'hooks/useLoading';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import IosShare from '@mui/icons-material/IosShare';
import { FlagCreationButton } from './FlagCreationButton/FlagCreationButton.tsx';
import { ImportButton } from './ImportButton/ImportButton.tsx';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(1.5),
}));

type ProjectFeatureTogglesHeaderProps = {
    isLoading?: boolean;
    totalItems?: number;
    environmentsToExport?: string[];
    actions?: ReactNode;
    title?: string;
};

export const ProjectFeatureTogglesHeader: FC<
    ProjectFeatureTogglesHeaderProps
> = ({
    isLoading,
    totalItems,
    environmentsToExport,
    actions,
    title = 'Feature flags',
}) => {
    const projectId = useRequiredPathParam('projectId');
    const headerLoadingRef = useLoading(isLoading || false);
    const [showExportDialog, setShowExportDialog] = useState(false);

    return (
        <Box ref={headerLoadingRef} aria-busy={isLoading} aria-live='polite'>
            <PageHeader
                titleElement={`${title} ${
                    totalItems !== undefined ? `(${totalItems})` : ''
                }`}
                actions={
                    <>
                        {actions}
                        <Tooltip title='Export all project flags' arrow>
                            <StyledIconButton
                                data-loading
                                onClick={() => setShowExportDialog(true)}
                            >
                                <IosShare />
                            </StyledIconButton>
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
