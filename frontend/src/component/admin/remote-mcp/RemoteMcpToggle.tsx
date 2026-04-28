import {
    Box,
    Chip,
    FormControlLabel,
    styled,
    Switch,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import useToast from 'hooks/useToast';

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
                    Enable remote MCP for this instance
                </StyledTitle>
                <StyledDescription>
                    When enabled, Unleash exposes a Streamable HTTP MCP server
                    at /api/mcp. Authentication uses standard Unleash API tokens
                    — admins choose which tokens may connect.
                </StyledDescription>
            </StyledCardLeft>
            <StyledCardRight>
                <Chip
                    label={enabled ? 'Enabled' : 'Disabled'}
                    color={enabled ? 'success' : 'default'}
                    variant='outlined'
                    size='small'
                />
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
                    label=''
                />
            </StyledCardRight>
        </StyledCard>
    );
};
