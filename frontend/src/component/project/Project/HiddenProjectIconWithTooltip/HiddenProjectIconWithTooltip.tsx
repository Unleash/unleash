import { styled } from '@mui/material';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';

export const StyledVisibilityIcon = styled(VisibilityOff)(({ theme }) => ({
    color: theme.palette.action.disabled,
}));

export const HiddenProjectIconWithTooltip = () => (
    <HtmlTooltip
        title={`This projects collaboration mode is set to private. The project and associated feature 
                            toggles can only be seen by you and the members of the project`}
        arrow
    >
        <StyledVisibilityIcon />
    </HtmlTooltip>
);
