import { Box, List, ListItem, ListItemButton, Typography } from '@mui/material';
import type { FilterItemParams } from '../../filter/FilterItem/FilterItem';
import type { FC } from 'react';
import { calculateDateRange, type RangeType } from './calculateDateRange';

export const DateRangePresets: FC<{
    onRangeChange: (value: {
        from: FilterItemParams;
        to: FilterItemParams;
    }) => void;
}> = ({ onRangeChange }) => {
    const rangeChangeHandler = (rangeType: RangeType) => () => {
        const [start, end] = calculateDateRange(rangeType);
        onRangeChange({
            from: {
                operator: 'IS',
                values: [start],
            },
            to: {
                operator: 'IS',
                values: [end],
            },
        });
    };

    return (
        <Box>
            <Typography variant='h3' sx={{ pb: 1, pl: 2 }}>
                Presets
            </Typography>
            <List disablePadding sx={{ pb: 2 }}>
                <ListItem disablePadding>
                    <ListItemButton onClick={rangeChangeHandler('thisMonth')}>
                        This month
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={rangeChangeHandler('previousMonth')}
                    >
                        Previous month
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={rangeChangeHandler('thisQuarter')}>
                        This quarter
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={rangeChangeHandler('previousQuarter')}
                    >
                        Previous quarter
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={rangeChangeHandler('thisYear')}>
                        This year
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={rangeChangeHandler('previousYear')}
                    >
                        Previous year
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );
};
