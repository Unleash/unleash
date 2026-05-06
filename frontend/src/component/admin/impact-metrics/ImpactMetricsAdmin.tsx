import { useEffect, useState } from 'react';
import {
    Button,
    FormControlLabel,
    Link,
    styled,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useUiFlag } from 'hooks/useUiFlag';
import NotFound from 'component/common/NotFound/NotFound';
import { useExternalImpactMetricsSource } from 'hooks/api/getters/useExternalImpactMetricsSource/useExternalImpactMetricsSource';
import { useExternalImpactMetricsSourceApi } from 'hooks/api/actions/useExternalImpactMetricsSourceApi/useExternalImpactMetricsSourceApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

const Layout = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const Card = styled('section')(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StatusCard = styled(Card)({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
});

const IconHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const Footer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const DOCS_URL =
    'https://docs.getunleash.io/concepts/impact-metrics#enable-external-metrics';

export const ImpactMetricsAdmin = () => {
    const externalImpactMetricsEnabled = useUiFlag('externalImpactMetrics');

    if (!externalImpactMetricsEnabled) {
        return <NotFound />;
    }

    return (
        <PermissionGuard permissions={[ADMIN]}>
            <ImpactMetricsPage />
        </PermissionGuard>
    );
};

const ImpactMetricsPage = () => {
    const { source, refetch, loading } = useExternalImpactMetricsSource();
    const { setExternalImpactMetricsSource, loading: saving } =
        useExternalImpactMetricsSourceApi();
    const { setToastData, setToastApiError } = useToast();

    const currentUrl = source.url ?? '';

    const [enabled, setEnabled] = useState(false);
    const [prometheusUrl, setPrometheusUrl] = useState('');

    useEffect(() => {
        setEnabled(source.enabled);
        setPrometheusUrl(currentUrl);
    }, [source.enabled, currentUrl]);

    const trimmedUrl = prometheusUrl.trim();
    const isDirty = enabled !== source.enabled || trimmedUrl !== currentUrl;
    const hasUrlWhenRequired = !enabled || trimmedUrl.length > 0;
    const canSave = isDirty && !saving && hasUrlWhenRequired;

    const handleCancel = () => {
        setEnabled(source.enabled);
        setPrometheusUrl(currentUrl);
    };

    const handleSave = async () => {
        try {
            await setExternalImpactMetricsSource({
                enabled,
                ...(trimmedUrl ? { url: trimmedUrl } : {}),
            });
            setToastData({
                type: 'success',
                text: 'External metrics source has been saved',
            });
            refetch();
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <PageContent header={<PageHeader titleElement='Impact Metrics' />}>
            <Layout>
                <Card>
                    <IconHeader>
                        <InfoOutlinedIcon fontSize='small' color='primary' />
                        <Typography fontWeight='bold'>
                            How does it work?
                        </Typography>
                    </IconHeader>
                    <Typography variant='body2' color='text.secondary'>
                        Unleash can read your organization's own metrics from
                        any Prometheus API compatible source (e.g. Prometheus,
                        VictoriaMetrics). Once connected, you can use those
                        metrics to:
                    </Typography>
                    <Typography
                        variant='body2'
                        color='text.secondary'
                        component='ul'
                    >
                        <li>
                            Create <strong>safeguards</strong> — automatic rules
                            that pause or roll back a feature when a metric
                            (e.g. error rate, latency) crosses a threshold.
                        </li>
                        <li>
                            Set up <strong>graph visualizations</strong> — embed
                            live charts on flag pages so you can see the impact
                            of a release without leaving Unleash.
                        </li>
                    </Typography>
                </Card>

                <StatusCard>
                    <Typography fontWeight='bold'>
                        External metrics status
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={enabled}
                                onChange={(_, checked) => setEnabled(checked)}
                                disabled={loading || saving}
                                name='enabled'
                            />
                        }
                        label={enabled ? 'Enabled' : 'Disabled'}
                    />
                </StatusCard>

                <Card>
                    <Typography fontWeight='bold'>
                        Metrics source URL
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        Add the URL to your organization's Prometheus API
                        compatible source (e.g. Prometheus, VictoriaMetrics).
                        Check out{' '}
                        <Link
                            href={DOCS_URL}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            our docs
                        </Link>{' '}
                        for further instructions.
                    </Typography>
                    <TextField
                        placeholder='Metrics source URL'
                        value={prometheusUrl}
                        onChange={(event) =>
                            setPrometheusUrl(event.target.value)
                        }
                        disabled={loading || saving}
                        fullWidth
                        size='small'
                    />
                </Card>

                <Footer>
                    <Button
                        onClick={handleCancel}
                        disabled={!isDirty || saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        onClick={handleSave}
                        disabled={!canSave}
                    >
                        Save
                    </Button>
                </Footer>
            </Layout>
        </PageContent>
    );
};
