import Download from '@mui/icons-material/Download';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import { Box } from '@mui/system';
import type { FC } from 'react';
import { useInstanceStats } from 'hooks/api/getters/useInstanceStats/useInstanceStats';
import { formatApiPath } from '../../../../utils/formatPath.ts';
import { PageContent } from '../../../common/PageContent/PageContent.tsx';
import { PageHeader } from '../../../common/PageHeader/PageHeader.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig.ts';

export const InstanceStats: FC = () => {
    const { stats } = useInstanceStats();
    const { uiConfig: { resourceLimits } } = useUiConfig();
    const readOnlyUsersUIEnabled = useUiFlag('readOnlyUsersUI');

    let versionTitle: string;
    let version: string | undefined;

    if (stats?.versionEnterprise) {
        versionTitle = 'Unleash Enterprise version';
        version = stats.versionEnterprise;
    } else {
        versionTitle = 'Unleash OSS version';
        version = stats?.versionOSS;
    }

    const apiTokensTotal = Object.values(stats?.apiTokens ?? {}).reduce(
        (acc, val) => acc + val,
        0,
    );

    const rows = [
        { title: 'Instance Id', value: stats?.instanceId, offset: false },
        { title: versionTitle, value: version },
        { title: 'Users', value: stats?.users },
        { title: 'Feature flags', value: stats?.featureToggles },
        { title: 'Projects', value: stats?.projects },
        { title: 'Environments', value: stats?.environments },
        { title: 'Roles', value: stats?.roles },
        { title: 'Groups', value: stats?.groups },
        { title: 'Context fields', value: stats?.contextFields },
        { title: 'Strategies', value: stats?.strategies },
        { title: 'Feature exports', value: stats?.featureExports },
        { title: 'Feature imports', value: stats?.featureImports },
        { title: 'Admin API tokens', value: stats?.apiTokens?.admin },
        { title: 'Client API tokens', value: stats?.apiTokens?.client },
        { title: 'Frontend API tokens', value: stats?.apiTokens?.frontend },
        { title: 'API tokens total', value: apiTokensTotal },
        { title: 'Segments', value: stats?.segments },
        {
            title: 'Highest number of strategies used for a single flag in a single environment',
            value: stats?.maxEnvironmentStrategies,
        },
        {
            title: 'Highest number of constraints used on a single strategy',
            value: stats?.maxConstraints,
        },
        {
            title: 'Highest number of values used for a single constraint',
            value: stats?.maxConstraintValues,
        },
        { title: 'Release templates', value: stats?.releaseTemplates },
        { title: 'Release plans', value: stats?.releasePlans },
    ];

    if (stats?.versionEnterprise) {
        rows.push(
            { title: 'SAML enabled', value: stats?.SAMLenabled ? 'Yes' : 'No' },
            { title: 'OIDC enabled', value: stats?.OIDCenabled ? 'Yes' : 'No' },
        );

        if (readOnlyUsersUIEnabled && resourceLimits.readOnlyUsers) {
            rows.push({
                title: 'ReadOnly users',
                value: stats?.readOnlyUsers,
            });
        }
    }

    return (
        <PageContent header={<PageHeader title='Instance Statistics' />}>
            <Box sx={{ display: 'grid', gap: 4 }}>
                <Table aria-label='Instance statistics'>
                    <TableHead>
                        <TableRow>
                            <TableCell>Field</TableCell>
                            <TableCell align='right'>Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.title}>
                                <TableCell component='th' scope='row'>
                                    <Box
                                        component='span'
                                        sx={(theme) => ({
                                            marginLeft: row.offset
                                                ? theme.spacing(2)
                                                : 0,
                                        })}
                                    >
                                        {row.title}
                                    </Box>
                                </TableCell>
                                <TableCell align='right'>{row.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <span style={{ textAlign: 'center' }}>
                    <Button
                        startIcon={<Download />}
                        aria-label='Download instance statistics'
                        color='primary'
                        variant='contained'
                        target='_blank'
                        rel='noreferrer'
                        href={formatApiPath(
                            '/api/admin/instance-admin/statistics/csv',
                        )}
                    >
                        Download
                    </Button>
                </span>
            </Box>
        </PageContent>
    );
};
