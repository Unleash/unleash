import {
    Box,
    FormControlLabel,
    styled,
    Switch,
    Typography,
} from '@mui/material';
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

interface IRemoteMcpToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
}

export const RemoteMcpToggle = ({
    enabled,
    onChange,
    disabled = false,
}: IRemoteMcpToggleProps) => {
    const {
        uiConfig: { unleashUrl },
    } = useUiConfig();

    return (
        <StyledCard>
            <StyledCardLeft>
                <StyledTitle variant='body1'>
                    Enable Remote MCP Server for this instance
                </StyledTitle>
                <StyledDescription>
                    When enabled, Unleash exposes a Streamable HTTP MCP server
                    at <code>{unleashUrl}/api/admin/mcp</code>
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
                            onChange={(_, checked) => onChange(checked)}
                            checked={enabled}
                            disabled={disabled}
                            name='enabled'
                        />
                    }
                    label={enabled ? 'Enabled' : 'Disabled'}
                />
            </StyledCardRight>
        </StyledCard>
    );
};
