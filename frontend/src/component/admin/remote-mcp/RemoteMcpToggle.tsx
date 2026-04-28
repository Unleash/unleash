import {
    Box,
    FormControlLabel,
    styled,
    Switch,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import useToast from 'hooks/useToast';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

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

export const RemoteMcpToggle = () => {
    const [enabled, setEnabled] = useState(false);
    const {
        uiConfig: { unleashUrl },
    } = useUiConfig();
    const { setToastData } = useToast();

    const handleToggle = () => {
        const next = !enabled;
        setEnabled(next);
        setToastData({
            type: 'success',
            text: `Remote MCP server has been successfully ${next ? 'enabled' : 'disabled'}`,
        });
    };

    return (
        <StyledCard>
            <StyledCardLeft>
                <StyledTitle variant='body1'>
                    Enable Remote MCP Server for this instance
                </StyledTitle>
                <StyledDescription>
                    When enabled, Unleash exposes a Streamable HTTP MCP server
                    at{' '}
                    <pre style={{ display: 'inline' }}>
                        {unleashUrl}/api/admin/mcp
                    </pre>
                </StyledDescription>
                <StyledDescription>
                    Authentication uses standard Unleash PAT tokens — once
                    enabled, users will be able to exchange their current login
                    session for a PAT token, valid for 24h.
                </StyledDescription>
            </StyledCardLeft>
            <StyledCardRight>
                <FormControlLabel
                    sx={{ margin: 0 }}
                    control={
                        <Switch
                            onChange={handleToggle}
                            checked={enabled}
                            disabled={true} // Toggle is disabled until backend support is implemented
                            name='enabled'
                        />
                    }
                    label={enabled ? 'Enabled' : 'Disabled'}
                />
            </StyledCardRight>
        </StyledCard>
    );
};
