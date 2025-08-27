import { PageContent } from 'component/common/PageContent/PageContent.tsx';
import { PageHeader } from '../../../common/PageHeader/PageHeader.tsx';
import { Button, styled, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { useImpactMetricsMetadata } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata.ts';
import { useMemo, useState } from 'react';
import { ChartConfigModal } from '../../../impact-metrics/ChartConfigModal/ChartConfigModal.tsx';

const StyledHeaderTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: 'normal',
    lineHeight: theme.spacing(5),
}));

export const FeatureImpactMetrics = () => {
    const [modalOpen, setModalOpen] = useState(false);

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

            <ChartConfigModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={() => {}}
                initialConfig={undefined}
                metricSeries={metricSeries}
                loading={metadataLoading}
            />
        </PageContent>
    );
};
