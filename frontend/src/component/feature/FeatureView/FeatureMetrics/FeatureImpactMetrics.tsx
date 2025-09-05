import { PageContent } from 'component/common/PageContent/PageContent.tsx';
import { PageHeader } from '../../../common/PageHeader/PageHeader.tsx';
import { Box, styled, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { useImpactMetricsMetadata } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata.ts';
import { type FC, useMemo, useState } from 'react';
import { ChartConfigModal } from '../../../impact-metrics/ChartConfigModal/ChartConfigModal.tsx';
import { useImpactMetricsApi } from 'hooks/api/actions/useImpactMetricsSettingsApi/useImpactMetricsApi.ts';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam.ts';
import { useFeatureImpactMetrics } from 'hooks/api/getters/useFeatureImpactMetrics/useFeatureImpactMetrics.ts';
import { ChartItem } from '../../../impact-metrics/ChartItem.tsx';
import {
    GridLayoutWrapper,
    type GridItem,
} from '../../../impact-metrics/GridLayoutWrapper.tsx';
import PermissionButton from 'component/common/PermissionButton/PermissionButton.tsx';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions.ts';
import useToast from 'hooks/useToast.tsx';
import { formatUnknownError } from 'utils/formatUnknownError.ts';
import type { ChartConfig } from '../../../impact-metrics/types.ts';

const StyledHeaderTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: 'normal',
    lineHeight: theme.spacing(5),
}));

type ModalState =
    | { type: 'closed' }
    | { type: 'creating' }
    | { type: 'editing'; config: ChartConfig };

export const FeatureImpactMetrics: FC = () => {
    const featureName = useRequiredPathParam('featureId');
    const projectId = useRequiredPathParam('projectId');

    const [modalState, setModalState] = useState<ModalState>({
        type: 'closed',
    });

    const { createImpactMetric, deleteImpactMetric } = useImpactMetricsApi({
        projectId,
        featureName,
    });
    const { impactMetrics, refetch } = useFeatureImpactMetrics({
        projectId,
        featureName,
    });
    const { setToastApiError } = useToast();

    const {
        metadata,
        loading: metadataLoading,
        error: metadataError,
    } = useImpactMetricsMetadata();

    const handleAddChart = () => {
        setModalState({ type: 'creating' });
    };

    const handleEditChart = (config: ChartConfig) => {
        setModalState({ type: 'editing', config });
    };

    const handleCloseModal = () => {
        setModalState({ type: 'closed' });
    };

    const handleSaveChart = async (data: Omit<ChartConfig, 'id'>) => {
        try {
            let configId: string | undefined = undefined;
            if (modalState.type === 'editing') {
                configId = modalState.config.id;
            }

            await createImpactMetric({
                ...data,
                feature: featureName,
                id: configId,
            });
            refetch();
            handleCloseModal();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const handleDeleteChart = async (configId: string) => {
        try {
            await deleteImpactMetric(configId);
            refetch();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const metricSeries = useMemo(() => {
        if (!metadata?.series) {
            return [];
        }
        return Object.entries(metadata.series).map(([name, rest]) => ({
            name,
            ...rest,
        }));
    }, [metadata]);

    const isModalOpen = modalState.type !== 'closed';
    const editingChart =
        modalState.type === 'editing' ? modalState.config : undefined;

    const gridItems: GridItem[] = useMemo(
        () =>
            impactMetrics.configs.map((config, index) => ({
                id: config.id,
                component: (
                    <ChartItem
                        config={config}
                        onEdit={() => handleEditChart(config)}
                        onDelete={() => handleDeleteChart(config.id)}
                        permission={UPDATE_FEATURE}
                        projectId={projectId}
                    />
                ),
                w: 6,
                h: 2,
                x: (index % 2) * 6,
                y: Math.floor(index / 2) * 2,
                static: true,
            })),
        [impactMetrics.configs, projectId],
    );

    return (
        <PageContent>
            <PageHeader
                titleElement={
                    <StyledHeaderTitle>Impact Metrics</StyledHeaderTitle>
                }
                actions={
                    <PermissionButton
                        variant='contained'
                        startIcon={<Add />}
                        onClick={handleAddChart}
                        disabled={metadataLoading || !!metadataError}
                        permission={UPDATE_FEATURE}
                        projectId={projectId}
                    >
                        Add Chart
                    </PermissionButton>
                }
            />

            {impactMetrics.configs.length > 0 && (
                <Box sx={(theme) => ({ marginTop: theme.spacing(3) })}>
                    <GridLayoutWrapper items={gridItems} />
                </Box>
            )}

            <ChartConfigModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveChart}
                initialConfig={editingChart}
                metricSeries={metricSeries}
                loading={metadataLoading}
            />
        </PageContent>
    );
};
