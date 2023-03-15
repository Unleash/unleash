import { useMemo, useState, VFC } from 'react';
import { Box, Button, Paper, styled, Typography } from '@mui/material';
import { Archive, FileDownload, Label, WatchLater } from '@mui/icons-material';
import type { FeatureSchema } from 'openapi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface ISelectionActionsBarProps {
    selectedIds: string[];
    data: FeatureSchema[];
}

const StyledContainer = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
}));

const StyledBar = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: theme.spacing(2, 3),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: theme.shape.borderRadiusLarge,
    columnGap: theme.spacing(1),
}));

const StyledCount = styled('span')(({ theme }) => ({
    background: theme.palette.secondary.main,
    color: theme.palette.background.paper,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
}));

const StyledText = styled(Typography)(({ theme }) => ({
    marginRight: theme.spacing(2),
}));

export const SelectionActionsBar: VFC<ISelectionActionsBarProps> = ({
    selectedIds,
    data,
}) => {
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

    if (selectedIds.length === 0) {
        return null;
    }

    return (
        <StyledContainer>
            <StyledBar elevation={4}>
                <StyledText>
                    <StyledCount>{selectedIds.length}</StyledCount>
                    &ensp;selected
                </StyledText>
                <Button
                    disabled
                    startIcon={<Archive />}
                    variant="outlined"
                    size="small"
                >
                    Archive
                </Button>
                <Button
                    disabled
                    startIcon={<WatchLater />}
                    variant="outlined"
                    size="small"
                >
                    Mark as stale
                </Button>
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
            </StyledBar>
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
        </StyledContainer>
    );
};
