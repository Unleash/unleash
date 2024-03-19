import { Box } from '@mui/material';
import { type FC, type ReactNode, useEffect, useRef, useState } from 'react';
import { StyledPopover } from 'component/filter/FilterItem/FilterItem.styles';
import { FilterItemChip } from 'component/filter/FilterItem/FilterItemChip/FilterItemChip';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { getLocalizedDateString } from '../util';
import type { FilterItemParams } from 'component/filter/FilterItem/FilterItem';

export interface IFilterDateItemProps {
    name: string;
    label: ReactNode;
    onChange: (value: FilterItemParams) => void;
    onChipClose: () => void;
    state: FilterItemParams | null | undefined;
    operators: [string, ...string[]];
}

export const FilterDateItem: FC<IFilterDateItemProps> = ({
    name,
    label,
    onChange,
    onChipClose,
    state,
    operators,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const { locationSettings } = useLocationSettings();

    const open = () => {
        setAnchorEl(ref.current);
    };

    useEffect(() => {
        if (!state) {
            open();
        }
    }, []);

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
        onChange({ operator: operators[0], values: [] });
        onClose();
        onChipClose();
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
                </LocalizationProvider>
            </StyledPopover>
        </>
    );
};
