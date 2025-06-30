import { useTheme } from '@mui/material';

export const useSeriesColor = () => {
    const theme = useTheme();
    const colors = theme.palette.charts.series;

    return (seriesLabel: string): string => {
        let hash = 0;
        for (let i = 0; i < seriesLabel.length; i++) {
            const char = seriesLabel.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };
};
