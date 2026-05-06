import { styled } from '@mui/material';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';

export const NudgeLightbulb = styled(LightbulbOutlined)(({ theme }) => ({
    fontSize: '1rem',
    marginLeft: theme.spacing(0.5),
    '@keyframes nudge-turn-on': {
        '0%, 30%': { opacity: 0.2, color: theme.palette.text.secondary },
        '35%, 75%': { opacity: 1, color: theme.palette.primary.main },
        '80%, 100%': { opacity: 0.2, color: theme.palette.text.secondary },
    },
    animation: 'nudge-turn-on 8s ease-in-out infinite',
}));
