import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    FormControlLabel,
    styled,
    Switch,
    Typography,
} from '@mui/material';
import useToast from 'hooks/useToast';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useRemoteMcpSettings } from 'hooks/api/getters/useRemoteMcpSettings/useRemoteMcpSettings';
import { useRemoteMcpSettingsApi } from 'hooks/api/actions/useRemoteMcpSettingsApi/useRemoteMcpSettingsApi';
import { useEventTracker } from 'hooks/useEventTracker';
import { formatUnknownError } from 'utils/formatUnknownError';

const StyledCard = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
}));

const StyledCardLeft = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    maxWidth: '75%',
}));

const StyledCardRight = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexShrink: 0,
}));

const StyledTitle = styled(Typography)({
    fontWeight: 'bold',
});

const StyledDescription = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

const Footer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

export const RemoteMcpToggle = () => {
    const { settings, loading, refetch } = useRemoteMcpSettings();
    const { setRemoteMcpSettings, loading: saving } = useRemoteMcpSettingsApi();
    const {
        uiConfig: { unleashUrl },
    } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const { trackEvent } = useEventTracker();

    const [enabled, setEnabled] = useState(settings.enabled);

    useEffect(() => {
        setEnabled(settings.enabled);
    }, [settings.enabled]);

    const isDirty = enabled !== settings.enabled;

    const handleCancel = () => {
        setEnabled(settings.enabled);
    };

    const handleSave = async () => {
        try {
            await setRemoteMcpSettings(enabled);
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
        <>
            <StyledCard>
                <StyledCardLeft>
                    <StyledTitle variant='body1'>
                        Enable Remote MCP Server for this instance
                    </StyledTitle>
                    <StyledDescription>
                        When enabled, Unleash exposes a Streamable HTTP MCP
                        server at <code>{unleashUrl}/api/admin/mcp</code>
                    </StyledDescription>
                    <StyledDescription>
                        Authentication uses standard Unleash PAT tokens — once
                        enabled, users will be able to exchange their current
                        login session for a PAT token, valid for 24h.
                    </StyledDescription>
                </StyledCardLeft>
                <StyledCardRight>
                    <FormControlLabel
                        sx={{ margin: 0 }}
                        control={
                            <Switch
                                onChange={(_, checked) => setEnabled(checked)}
                                checked={enabled}
                                disabled={loading || saving}
                                name='enabled'
                            />
                        }
                        label={enabled ? 'Enabled' : 'Disabled'}
                    />
                </StyledCardRight>
            </StyledCard>
            <Footer>
                <Button onClick={handleCancel} disabled={!isDirty || saving}>
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
        </>
    );
};
