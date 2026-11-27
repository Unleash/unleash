import { styled } from '@mui/material';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { collaborationModeDescriptions } from 'component/project/collaborationModeDescriptions';

export const StyledVisibilityIcon = styled(VisibilityOff)(({ theme }) => ({
    color: theme.palette.action.disabled,
}));

export const HiddenProjectIconWithTooltip = () => (
    <HtmlTooltip title={collaborationModeDescriptions.private} arrow>
        <StyledVisibilityIcon />
    </HtmlTooltip>
);
