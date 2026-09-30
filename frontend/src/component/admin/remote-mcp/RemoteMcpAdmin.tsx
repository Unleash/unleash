import { useEffect, useState } from 'react';
import { Alert, Box, Button, styled, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import useToast from 'hooks/useToast';
import { useRemoteMcpSettings } from 'hooks/api/getters/useRemoteMcpSettings/useRemoteMcpSettings';
import { useRemoteMcpSettingsApi } from 'hooks/api/actions/useRemoteMcpSettingsApi/useRemoteMcpSettingsApi';
import { useEventTracker } from 'hooks/useEventTracker';
import { formatUnknownError } from 'utils/formatUnknownError';
import { RemoteMcpToggle } from './RemoteMcpToggle.tsx';
import { RemoteMcpFeedbackToggle } from './RemoteMcpFeedbackToggle.tsx';

const DOCS_URL = 'https://docs.getunleash.io/integrate/mcp#remote-mcp-server';

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

const Footer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

export const RemoteMcpAdmin = () => {
    const { isEnterprise } = useUiConfig();

    if (!isEnterprise()) {
        return <PremiumFeature feature='remote-mcp' page />;
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
    const feedbackOptInAvailable = useUiFlag('remoteMcpFeedback');
    const { settings, loading, refetch } = useRemoteMcpSettings();
    const { setRemoteMcpSettings, loading: saving } = useRemoteMcpSettingsApi();
    const { setToastData, setToastApiError } = useToast();
    const { trackEvent } = useEventTracker();

    const savedFeedbackOptIn = settings.feedbackOptIn ?? false;
    const [enabled, setEnabled] = useState(settings.enabled);
    const [feedbackOptIn, setFeedbackOptIn] = useState(savedFeedbackOptIn);

    useEffect(() => {
        setEnabled(settings.enabled);
        setFeedbackOptIn(savedFeedbackOptIn);
    }, [settings.enabled, savedFeedbackOptIn]);

    const isDirty =
        enabled !== settings.enabled || feedbackOptIn !== savedFeedbackOptIn;

    const handleCancel = () => {
        setEnabled(settings.enabled);
        setFeedbackOptIn(savedFeedbackOptIn);
    };

    const handleSave = async () => {
        try {
            await setRemoteMcpSettings(
                feedbackOptInAvailable
                    ? { enabled, feedbackOptIn }
                    : { enabled },
            );
            trackEvent('remote-mcp', {
                props: { eventType: enabled ? 'enabled' : 'disabled' },
            });
            setToastData({
                type: 'success',
                text: `Remote MCP server has been successfully ${enabled ? 'enabled' : 'disabled'}`,
            });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        } finally {
            refetch();
        }
    };

    return (
        <PageContent
            header={
                <PageHeader
                    heading={
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
                <RemoteMcpToggle
                    enabled={enabled}
                    onChange={setEnabled}
                    disabled={loading || saving}
                />
                {feedbackOptInAvailable ? (
                    <RemoteMcpFeedbackToggle
                        feedbackOptIn={feedbackOptIn}
                        onChange={setFeedbackOptIn}
                        disabled={!enabled || loading || saving}
                    />
                ) : null}
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
                        disabled={!isDirty || saving}
                    >
                        Save
                    </Button>
                </Footer>
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
