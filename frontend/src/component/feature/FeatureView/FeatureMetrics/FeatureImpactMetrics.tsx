import { PageContent } from 'component/common/PageContent/PageContent.tsx';
import { PageHeader } from '../../../common/PageHeader/PageHeader.tsx';
import { Button, styled, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { useImpactMetricsMetadata } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata.ts';
import { type FC, useMemo, useState } from 'react';
import { ChartConfigModal } from '../../../impact-metrics/ChartConfigModal/ChartConfigModal.tsx';
import { useImpactMetricsApi } from 'hooks/api/actions/useImpactMetricsSettingsApi/useImpactMetricsApi.ts';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam.ts';
import { useFeatureImpactMetrics } from 'hooks/api/getters/useFeatureImpactMetrics/useFeatureImpactMetrics.ts';
import { ChartItem } from '../../../impact-metrics/ChartItem.tsx';

const StyledHeaderTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: 'normal',
    lineHeight: theme.spacing(5),
}));

export const FeatureImpactMetrics: FC = () => {
    const feature = useRequiredPathParam('featureId');
    const [modalOpen, setModalOpen] = useState(false);
    const { createImpactMetric } = useImpactMetricsApi();
    const { impactMetrics } = useFeatureImpactMetrics(feature);

    const {
        metadata,
        loading: metadataLoading,
        error: metadataError,
    } = useImpactMetricsMetadata();

    const handleAddChart = () => {
        setModalOpen(true);
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

    return (
        <PageContent>
            <PageHeader
                titleElement={
                    <StyledHeaderTitle>Impact Metrics</StyledHeaderTitle>
                }
                actions={
                    <Button
                        variant='contained'
                        startIcon={<Add />}
                        onClick={handleAddChart}
                        disabled={metadataLoading || !!metadataError}
                    >
                        Add Chart
                    </Button>
                }
            />

            <>
                {impactMetrics.configs.map((config) => (
                    <ChartItem
                        config={config}
                        onEdit={() => {}}
                        onDelete={() => {}}
                    />
                ))}
            </>

            <ChartConfigModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={(data) => createImpactMetric({ ...data, feature })}
                initialConfig={undefined}
                metricSeries={metricSeries}
                loading={metadataLoading}
            />
        </PageContent>
    );
};
