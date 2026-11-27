import type { FC } from 'react';
import { styled, type Theme } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { collaborationModeDescriptions } from 'component/project/Project/ProjectEnterpriseSettingsForm/collaborationModeDescriptions';

const iconStyles = ({ theme }: { theme: Theme }) => ({
    flex: 'none',
    fontSize: theme.spacing(2),
    color: theme.palette.text.secondary,
});

const StyledPrivateIcon = styled(VisibilityOffOutlinedIcon)(iconStyles);

const StyledProtectedIcon = styled(LockOutlinedIcon)(iconStyles);

const accessibleIconProps = (label: string) => ({
    'aria-hidden': false,
    role: 'img',
    'aria-label': label,
});

export const PrivateProjectIcon: FC = () => (
    <HtmlTooltip title={collaborationModeDescriptions.private} arrow>
        <StyledPrivateIcon {...accessibleIconProps('Private project')} />
    </HtmlTooltip>
);

export const ProtectedProjectIcon: FC = () => (
    <HtmlTooltip title={collaborationModeDescriptions.protected} arrow>
        <StyledProtectedIcon {...accessibleIconProps('Protected project')} />
    </HtmlTooltip>
);
