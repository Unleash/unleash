import { Download } from '@mui/icons-material';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import { Box } from '@mui/system';
import { VFC } from 'react';
import { useInstanceStats } from '../../../../hooks/api/getters/useInstanceStats/useInstanceStats';
import { formatApiPath } from '../../../../utils/formatPath';
import { PageContent } from '../../../common/PageContent/PageContent';
import { PageHeader } from '../../../common/PageHeader/PageHeader';

export const InstanceStats: VFC = () => {
    const { stats } = useInstanceStats();

    let versionTitle;
    let version;

    if (stats?.versionEnterprise) {
        versionTitle = 'Unleash Enterprise version';
        version = stats.versionEnterprise;
    } else {
        versionTitle = 'Unleash OSS version';
        version = stats?.versionOSS;
    }

    const rows = [
        { title: 'Instance Id', value: stats?.instanceId },
        { title: versionTitle, value: version },
        { title: 'Users', value: stats?.users },
        { title: 'Feature toggles', value: stats?.featureToggles },
        { title: 'Projects', value: stats?.projects },
        { title: 'Environments', value: stats?.environments },
        { title: 'Roles', value: stats?.roles },
        { title: 'Groups', value: stats?.groups },
        { title: 'Context fields', value: stats?.contextFields },
        { title: 'Strategies', value: stats?.strategies },
        { title: 'Feature exports', value: stats?.featureExports },
        { title: 'Feature imports', value: stats?.featureImports },
    ];

    if (stats?.versionEnterprise) {
        rows.push(
            { title: 'SAML enabled', value: stats?.SAMLenabled ? 'Yes' : 'No' },
            { title: 'OIDC enabled', value: stats?.OIDCenabled ? 'Yes' : 'No' }
        );
    }

    return (
        <PageContent header={<PageHeader title="Instance Statistics" />}>
            <Box sx={{ display: 'grid', gap: 4 }}>
                <Table aria-label="Instance statistics">
                    <TableHead>
                        <TableRow>
                            <TableCell>Field</TableCell>
                            <TableCell align="right">Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map(row => (
                            <TableRow key={row.title}>
                                <TableCell component="th" scope="row">
                                    {row.title}
                                </TableCell>
                                <TableCell align="right">{row.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <span style={{ textAlign: 'center' }}>
                    <Button
                        startIcon={<Download />}
                        aria-label="Download instance statistics"
                        color="primary"
                        variant="contained"
                        target="_blank"
                        rel="noreferrer"
                        href={formatApiPath(
                            '/api/admin/instance-admin/statistics/csv'
                        )}
                    >
                        Download
                    </Button>
                </span>
            </Box>
        </PageContent>
    );
};
