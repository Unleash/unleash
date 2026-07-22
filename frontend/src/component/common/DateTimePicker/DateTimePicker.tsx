import { INPUT_ERROR_TEXT } from 'utils/testIds';
import type { OutlinedTextFieldProps } from '@mui/material';
import { parseValidDate } from '../util.ts';
import { format } from 'date-fns';
import Input from '../Input/Input';

interface IDateTimePickerProps
    extends Omit<OutlinedTextFieldProps, 'variant' | 'rows'> {
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
    return `${format(date, 'yyyy-MM-dd')}T${format(date, 'HH:mm')}`;
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
    slotProps,
    ...rest
}: IDateTimePickerProps) => {
    const getDate = type === 'datetime' ? formatDateTime : formatDate;
    const inputType = type === 'datetime' ? 'datetime-local' : 'date';

    return (
        <Input
            label={label}
            type={inputType}
            size='small'
            error={error}
            errorText={errorText}
            value={getDate(value.toISOString())}
            onChange={(e) => {
                const parsedDate = parseValidDate(e.target.value);
                onChange(parsedDate ?? value);
            }}
            {...rest}
            slotProps={{
                htmlInput: {
                    min: min ? getDate(min.toISOString()) : min,
                    max: max ? getDate(max.toISOString()) : max,
                },

                formHelperText: {
                    'data-testid': INPUT_ERROR_TEXT,
                },
                ...slotProps,
            }}
        />
    );
};
