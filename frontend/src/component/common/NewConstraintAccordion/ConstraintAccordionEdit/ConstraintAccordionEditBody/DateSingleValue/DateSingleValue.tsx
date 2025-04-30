import Input from 'component/common/Input/Input';
import { parseDateValue, parseValidDate } from 'component/common/util';

import { useId, useMemo, useState } from 'react';
import { styled } from '@mui/material';
import TimezoneCountries from 'countries-and-timezones';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';

interface IDateSingleValueProps {
    setValue: (value: string) => void;
    value?: string;
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
}

const StyledWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    marginBottom: theme.spacing(1),
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    border: 'none',
    '*': {
        border: 'none',
        padding: 0,
    },
    // '&::before': {
    //     border: 'none',
    // },
}));

export const DateSingleValue = ({
    setValue,
    value,
    error,
    setError,
}: IDateSingleValueProps) => {
    const timezones = Object.values(
        TimezoneCountries.getAllTimezones({ deprecated: false }),
    ).map((timezone) => ({
        key: timezone.name,
        label: `${timezone.name}`,
        utcOffset: timezone.utcOffsetStr,
    }));
    const { timeZone: localTimezoneName } =
        Intl.DateTimeFormat().resolvedOptions();
    const [pickedDate, setPickedDate] = useState(value || '');
    const inputId = useId();

    const timezoneText = useMemo<string>(() => {
        const localTimezone = timezones.find(
            (t) => t.key === localTimezoneName,
        );
        if (localTimezone != null) {
            return `${localTimezone.key} (UTC ${localTimezone.utcOffset})`;
        } else {
            return 'The time shown is in your local time zone according to your browser.';
        }
    }, [timezones, localTimezoneName]);

    if (!value) return null;

    return (
        <>
            <label htmlFor={inputId}>
                <ScreenReaderOnly>Date</ScreenReaderOnly>
            </label>
            <StyledInput
                id={inputId}
                hiddenLabel
                label=''
                size='small'
                type='datetime-local'
                value={parseDateValue(pickedDate)}
                onChange={(e) => {
                    setError('');
                    const parsedDate = parseValidDate(e.target.value);
                    const dateString = parsedDate?.toISOString();
                    dateString && setPickedDate(dateString);
                    dateString && setValue(dateString);
                }}
                InputLabelProps={{
                    shrink: true,
                }}
                error={Boolean(error)}
                errorText={error}
                required
            />
        </>
    );
};
