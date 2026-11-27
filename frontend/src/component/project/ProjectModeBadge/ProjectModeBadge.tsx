import type { FC } from 'react';
import { styled } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { collaborationModeDescriptions } from 'component/project/collaborationModeDescriptions';

type BadgeVariant = 'card' | 'nav';

interface IProjectModeBadgeProps {
    mode?: string;
    variant?: BadgeVariant;
}

const modeBadges = {
    private: { label: 'Private project', Icon: VisibilityOffOutlinedIcon },
    protected: { label: 'Protected project', Icon: LockOutlinedIcon },
};

type BadgedMode = keyof typeof modeBadges;

const isBadgedMode = (mode?: string): mode is BadgedMode =>
    mode !== undefined && Object.hasOwn(modeBadges, mode);

const StyledBadge = styled('span', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: BadgeVariant }>(({ theme, variant }) =>
    variant === 'nav'
        ? {
              display: 'flex',
              flex: 'none',
              fontSize: theme.spacing(2),
              color: theme.palette.text.secondary,
          }
        : {
              display: 'block',
              fontSize: theme.spacing(2.25),
              paddingTop: theme.spacing(0.75),
              color: theme.palette.primary.main,
          },
);

const StyledTooltipLabel = styled('strong')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

export const ProjectModeBadge: FC<IProjectModeBadgeProps> = ({
    mode,
    variant = 'card',
}) => {
    if (!isBadgedMode(mode)) {
        return null;
    }

    const { label, Icon } = modeBadges[mode];

    return (
        <HtmlTooltip
            title={
                <>
                    <StyledTooltipLabel>{label}:</StyledTooltipLabel>{' '}
                    {collaborationModeDescriptions[mode]}
                </>
            }
            arrow
            describeChild
        >
            <StyledBadge variant={variant} role='img' aria-label={label}>
                <Icon fontSize='inherit' />
            </StyledBadge>
        </HtmlTooltip>
    );
};
