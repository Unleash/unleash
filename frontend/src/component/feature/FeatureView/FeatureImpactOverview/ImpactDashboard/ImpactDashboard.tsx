import { type FC, useMemo, useState } from 'react';
import { Box, styled } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { useFeatureImpactMetrics } from 'hooks/api/getters/useFeatureImpactMetrics/useFeatureImpactMetrics';
import { useImpactMetricsOptions } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { useImpactMetricsApi } from 'hooks/api/actions/useImpactMetricsApi/useImpactMetricsApi';
import { ChartConfigModal } from 'component/impact-metrics/ChartConfigModal/ChartConfigModal';
import { ImpactChartWithEvents } from './ImpactChartWithEvents';
import { ImpactEmptyState } from './ImpactEmptyState';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { ChartConfig } from 'component/impact-metrics/types';
import type { TimeRange } from '../FeatureImpactOverview';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const StyledTitle = styled('h2')(({ theme }) => ({
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    margin: 0,
}));

const StyledChartsGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
    },
}));

type ModalState =
    | { type: 'closed' }
    | { type: 'creating' }
    | { type: 'editing'; config: ChartConfig };

interface ImpactDashboardProps {
    featureName: string;
    projectId: string;
    timeRange: TimeRange;
}

export const ImpactDashboard: FC<ImpactDashboardProps> = ({
    featureName,
    projectId,
    timeRange,
}) => {
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
        metricOptions,
        loading: metadataLoading,
        error: metadataError,
    } = useImpactMetricsOptions();

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
            let configId: string | undefined;
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

    const isModalOpen = modalState.type !== 'closed';
    const editingChart =
        modalState.type === 'editing' ? modalState.config : undefined;

    const maxChartsReached = impactMetrics.configs.length >= 20;
    const isDisabled = metadataLoading || !!metadataError || maxChartsReached;
    const hasCharts = impactMetrics.configs.length > 0;

    return (
        <StyledContainer>
            <StyledHeader>
                <StyledTitle>Impact Metrics</StyledTitle>
                <PermissionButton
                    variant='outlined'
                    size='small'
                    startIcon={<Add />}
                    onClick={handleAddChart}
                    disabled={isDisabled}
                    permission={UPDATE_FEATURE}
                    projectId={projectId}
                    tooltipProps={
                        maxChartsReached
                            ? {
                                  title: 'Maximum of 20 impact metrics charts allowed',
                                  arrow: true,
                              }
                            : undefined
                    }
                >
                    Add Chart
                </PermissionButton>
            </StyledHeader>

            {hasCharts ? (
                <StyledChartsGrid>
                    {impactMetrics.configs.map((config) => (
                        <ImpactChartWithEvents
                            key={config.id}
                            config={config}
                            featureName={featureName}
                            projectId={projectId}
                            timeRange={timeRange}
                            onEdit={() => handleEditChart(config)}
                            onDelete={() => handleDeleteChart(config.id)}
                        />
                    ))}
                </StyledChartsGrid>
            ) : (
                <ImpactEmptyState onAddChart={handleAddChart} />
            )}

            <ChartConfigModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveChart}
                initialConfig={editingChart}
                metricSeries={metricOptions}
                loading={metadataLoading}
            />
        </StyledContainer>
    );
};
