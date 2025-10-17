import { useTheme } from '@mui/material';
import { useMemo } from 'react';
import { fillGradientPrimary } from '../components/LineChart/LineChart.jsx';
import type { ChartData } from 'chart.js';

type PlaceholderDataOptions = {
    fill?: boolean;
    type?: 'rising' | 'constant' | 'double';
};

export const usePlaceholderData = (
    placeholderDataOptions?: PlaceholderDataOptions,
): ChartData<'line', number[]> => {
    const { fill = false, type = 'constant' } = placeholderDataOptions || {};
    const theme = useTheme();

    return useMemo(
        () => ({
            labels: Array.from({ length: 15 }, (_, i) => i + 1).map(
                (i) =>
                    new Date(Date.now() - (15 - i) * 7 * 24 * 60 * 60 * 1000),
            ),
            datasets:
                type === 'double'
                    ? [
                          {
                              label: 'Total flags',
                              data: [
                                  43, 66, 55, 65, 62, 72, 75, 73, 80, 65, 62,
                                  61, 69, 70, 77,
                              ],
                              borderColor: theme.palette.primary.light,
                              backgroundColor: theme.palette.primary.light,
                          },
                          {
                              label: 'Stale',
                              data: [
                                  3, 5, 4, 6, 2, 7, 5, 3, 8, 3, 5, 11, 8, 4, 3,
                              ],
                              borderColor: theme.palette.warning.border,
                              backgroundColor: theme.palette.warning.border,
                          },
                      ]
                    : [
                          {
                              label: '',
                              data:
                                  type === 'rising'
                                      ? [
                                            3, 5, 15, 17, 25, 40, 47, 48, 55,
                                            65, 62, 72, 75, 73, 80,
                                        ]
                                      : [
                                            54, 52, 53, 49, 54, 50, 47, 46, 51,
                                            51, 50, 51, 49, 49, 51,
                                        ],
                              borderColor: theme.palette.primary.light,
                              backgroundColor: fill
                                  ? fillGradientPrimary
                                  : theme.palette.primary.light,
                              fill,
                          },
                      ],
        }),
        [theme, fill],
    );
};
