import { useState } from 'react';
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

const RightAlignedRow = styled('div')({
    display: 'flex',
    justifyContent: 'flex-end',
});

const Footer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StatusToggleLabel = styled(FormControlLabel)({
    margin: 0,
});

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
    const [enabled, setEnabled] = useState(false);
    const [prometheusUrl, setPrometheusUrl] = useState('');

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
                    <StatusToggleLabel
                        control={
                            <Switch
                                checked={enabled}
                                onChange={(_, checked) => setEnabled(checked)}
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
                        fullWidth
                        size='small'
                    />
                    <RightAlignedRow>
                        <Button variant='contained' disabled={!prometheusUrl}>
                            Test connection
                        </Button>
                    </RightAlignedRow>
                </Card>

                <Footer>
                    <Button>Cancel</Button>
                    <Button variant='contained'>Save</Button>
                </Footer>
            </Layout>
        </PageContent>
    );
};
