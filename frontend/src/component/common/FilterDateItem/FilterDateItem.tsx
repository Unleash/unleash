import { Box } from '@mui/material';
import { type FC, type ReactNode, useEffect, useRef, useState } from 'react';
import { StyledPopover } from 'component/filter/FilterItem/FilterItem.styles';
import { FilterItemChip } from 'component/filter/FilterItem/FilterItemChip/FilterItemChip';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isBefore, isAfter } from 'date-fns';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { getLocalizedDateString } from '../util.ts';
import type { FilterItemParams } from 'component/filter/FilterItem/FilterItem';
import { DateRangePresets } from './DateRangePresets.tsx';
import type { FilterItemParamHolder } from 'component/filter/Filters/Filters.tsx';

export interface IFilterDateItemProps {
    name: string;
    label: ReactNode;
    onChange: (value: FilterItemParams) => void;
    onRangeChange?: (value: {
        from: FilterItemParams;
        to: FilterItemParams;
    }) => void;
    onChipClose?: () => void;
    state: FilterItemParams | null | undefined;
    allState?: FilterItemParamHolder;
    fromFilterKey?: string;
    toFilterKey?: string;
    operators: [string, ...string[]];
    initMode?: 'auto-open' | 'manual';
}

export const FilterDateItem: FC<IFilterDateItemProps> = ({
    name,
    label,
    onChange,
    onRangeChange,
    onChipClose,
    state,
    allState,
    fromFilterKey,
    toFilterKey,
    operators,
    initMode = 'auto-open',
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const { locationSettings } = useLocationSettings();

    const open = () => setAnchorEl(ref.current);
    const onClose = () => setAnchorEl(null);

    useEffect(() => {
        if (!state && initMode === 'auto-open') {
            open();
        }
    }, []);

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
    const onDelete = onChipClose
        ? () => {
              onChange({ operator: operators[0], values: [] });
              onClose();
              onChipClose();
          }
        : undefined;

    useEffect(() => {
        if (state && !operators.includes(state.operator)) {
            onChange({
                operator: operators[0],
                values: state.values,
            });
        }
    }, [state]);

    const minDate =
        fromFilterKey && allState?.[fromFilterKey]?.values?.[0]
            ? new Date(allState[fromFilterKey].values[0])
            : undefined;
    const maxDate =
        toFilterKey && allState?.[toFilterKey]?.values?.[0]
            ? new Date(allState[toFilterKey].values[0])
            : undefined;

    return (
        <>
            <Box ref={ref}>
                <FilterItemChip
                    label={label}
                    name={name}
                    selectedDisplayOptions={selectedOptions}
                    onDelete={onDelete}
                    onClick={open}
                    operator={currentOperator}
                    operatorOptions={operators}
                    onChangeOperator={(operator) => {
                        const formattedValue = selectedDate
                            ? format(selectedDate, 'yyyy-MM-dd')
                            : '';
                        onChange({ operator, values: [formattedValue] });
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
                        minDate={name === 'Date To' ? minDate : undefined}
                        maxDate={name === 'Date From' ? maxDate : undefined}
                        shouldDisableDate={(date) => {
                            if (name === 'Date To' && minDate)
                                return isBefore(date, minDate);
                            if (name === 'Date From' && maxDate)
                                return isAfter(date, maxDate);
                            return false;
                        }}
                        onChange={(value) => {
                            const formattedValue = value
                                ? format(value, 'yyyy-MM-dd')
                                : '';
                            onChange({
                                operator: currentOperator,
                                values: [formattedValue],
                            });
                        }}
                    />
                    {onRangeChange && (
                        <DateRangePresets onRangeChange={onRangeChange} />
                    )}
                </LocalizationProvider>
            </StyledPopover>
        </>
    );
};
