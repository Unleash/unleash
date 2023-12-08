import { Box } from '@mui/material';
import React, { FC, useEffect, useRef, useState } from 'react';
import { StyledPopover } from '../FilterItem/FilterItem.styles';
import { FilterItemChip } from '../FilterItem/FilterItemChip/FilterItemChip';
import { FilterItem } from '../FilterItem/FilterItem';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useLocationSettings } from '../../../hooks/useLocationSettings';
import { getLocalizedDateString } from '../util';

interface IFilterDateItemProps {
    label: string;
    onChange: (value: FilterItem | undefined) => void;
    onChipClose: () => void;
    state: FilterItem | null | undefined;
    operators: [string, ...string[]];
}

export const FilterDateItem: FC<IFilterDateItemProps> = ({
    label,
    onChange,
    onChipClose,
    state,
    operators,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const { locationSettings } = useLocationSettings();

    const onClick = () => {
        setAnchorEl(ref.current);
    };

    const onClose = () => {
        setAnchorEl(null);
    };

    const selectedOptions = state
        ? [
              getLocalizedDateString(
                  state.values[0],
                  locationSettings.locale,
              ) || '',
          ]
        : [];
    const selectedDate = state ? new Date(state.values[0]) : null;
    const currentOperator = state ? state.operator : operators[0];
    const onDelete = () => {
        onChange(undefined);
        onClose();
        onChipClose();
    };

    const setValue = (value: Date | null) => {
        const formattedValue = value ? format(value, 'yyyy-MM-dd') : '';
        onChange({ operator: currentOperator, values: [formattedValue] });
    };

    useEffect(() => {
        if (state && !operators.includes(state.operator)) {
            onChange({
                operator: operators[0],
                values: state.values,
            });
        }
    }, [state]);

    return (
        <>
            <Box ref={ref}>
                <FilterItemChip
                    label={label}
                    selectedOptions={selectedOptions}
                    onDelete={onDelete}
                    onClick={onClick}
                    operator={currentOperator}
                    operatorOptions={operators}
                    onChangeOperator={(operator) => {
                        onChange({ operator, values: selectedOptions ?? [] });
                    }}
                />
            </Box>
            <StyledPopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={onClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateCalendar
                        displayWeekNumber
                        value={selectedDate}
                        onChange={(newValue) => setValue(newValue)}
                    />
                </LocalizationProvider>
            </StyledPopover>
        </>
    );
};
