import { INPUT_ERROR_TEXT } from 'utils/testIds';
import { TextField, OutlinedTextFieldProps } from '@mui/material';
import { parseValidDate } from '../util';
import { format } from 'date-fns';

interface IDateTimePickerProps extends Omit<OutlinedTextFieldProps, 'variant'> {
    label: string;
    type?: 'date' | 'datetime';
    error?: boolean;
    errorText?: string;
    min?: Date;
    max?: Date;
    value: Date;
    onChange: (e: any) => any;
}

export const formatDate = (value: string) => {
    const date = new Date(value);
    return format(date, 'yyyy-MM-dd');
};

export const formatDateTime = (value: string) => {
    const date = new Date(value);
    return format(date, 'yyyy-MM-dd') + 'T' + format(date, 'HH:mm');
};

export const DateTimePicker = ({
    label,
    type = 'datetime',
    error,
    errorText,
    min,
    max,
    value,
    onChange,
    ...rest
}: IDateTimePickerProps) => {
    const getDate = type === 'datetime' ? formatDateTime : formatDate;
    const inputType = type === 'datetime' ? 'datetime-local' : 'date';

    return (
        <TextField
            type={inputType}
            size="small"
            variant="outlined"
            label={label}
            error={error}
            helperText={errorText}
            value={getDate(value.toISOString())}
            onChange={e => {
                const parsedDate = parseValidDate(e.target.value);
                onChange(parsedDate ?? value);
            }}
            FormHelperTextProps={{
                ['data-testid']: INPUT_ERROR_TEXT,
            }}
            inputProps={{
                min: min ? getDate(min.toISOString()) : min,
                max: max ? getDate(max.toISOString()) : max,
            }}
            {...rest}
        />
    );
};
