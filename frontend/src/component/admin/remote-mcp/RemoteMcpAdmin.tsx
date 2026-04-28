import { Alert, Box, styled, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { RemoteMcpToggle } from './RemoteMcpToggle.tsx';
import { useUiFlag } from 'hooks/useUiFlag';
import NotFound from 'component/common/NotFound/NotFound';

const DOCS_URL =
    'https://github.com/Unleash/unleash-mcp#remote-agent-setup-experimental';

const StyledTitleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledLayout = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledDocsLink = styled('a')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body2.fontSize,
    '&:hover': { textDecoration: 'underline' },
}));

export const RemoteMcpAdmin = () => {
    const remoteMcpEnabled = useUiFlag('remoteMcpServer');

    if (!remoteMcpEnabled) {
        return <NotFound />;
    }

    return (
        <div>
            <PermissionGuard permissions={[ADMIN]}>
                <RemoteMcpPage />
            </PermissionGuard>
        </div>
    );
};

const RemoteMcpPage = () => {
    return (
        <PageContent
            header={
                <PageHeader
                    titleElement={
                        <StyledTitleRow>
                            Remote MCP Server
                            <HelpIcon
                                htmlTooltip
                                tooltip={
                                    <Typography variant='body2'>
                                        The Model Context Protocol (MCP) server
                                        allows AI assistants to interact with
                                        Unleash using natural language.
                                    </Typography>
                                }
                            />
                        </StyledTitleRow>
                    }
                />
            }
        >
            <StyledLayout>
                <Alert severity='warning'>
                    Only enable this if your organization allows OAuth 2.0
                    Dynamic Client Registration authorization workflow.
                </Alert>
                <RemoteMcpToggle />
                <StyledDocsLink
                    href={DOCS_URL}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <MenuBookIcon fontSize='small' />
                    Read the docs
                </StyledDocsLink>
            </StyledLayout>
        </PageContent>
    );
};
