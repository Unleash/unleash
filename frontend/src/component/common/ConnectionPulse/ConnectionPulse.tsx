import { alpha, keyframes, styled } from '@mui/material';
import MoreHoriz from '@mui/icons-material/MoreHoriz';

const StyledConnectionPulse = styled('span')(({ theme }) => {
    const pulse = keyframes`
        0% {
            box-shadow:
                0 0 0 0 ${alpha(theme.palette.primary.main, 0.5)},
                0 0 0 0 ${alpha(theme.palette.primary.main, 0.3)};
        }
        70% {
            box-shadow:
                0 0 0 6px ${alpha(theme.palette.primary.main, 0)},
                0 0 0 12px ${alpha(theme.palette.primary.main, 0)};
        }
        100% {
            box-shadow:
                0 0 0 0 ${alpha(theme.palette.primary.main, 0)},
                0 0 0 0 ${alpha(theme.palette.primary.main, 0)};
        }
    `;

    return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: theme.spacing(3),
        height: theme.spacing(3),
        borderRadius: theme.shape.borderRadiusExtraLarge,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        animation: `${pulse} 1.8s ease-out infinite`,
        '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
        },
    };
});

export const ConnectionPulse = () => (
    <StyledConnectionPulse>
        <MoreHoriz fontSize='small' />
    </StyledConnectionPulse>
);
