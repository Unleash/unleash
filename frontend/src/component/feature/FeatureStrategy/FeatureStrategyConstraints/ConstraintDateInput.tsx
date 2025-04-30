import Input from 'component/common/Input/Input';
import { parseDateValue, parseValidDate } from 'component/common/util';

import { useId, useMemo, useState } from 'react';
import { styled } from '@mui/material';
import TimezoneCountries from 'countries-and-timezones';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

interface IDateSingleValueProps {
    setValue: (value: string) => void;
    value?: string;
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
}

const StyledInput = styled(Input)({
    border: 'none',
    '*': {
        border: 'none',
        padding: 0,
    },
});

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    alignItems: 'center',
}));

export const ConstraintDateInput = ({
    setValue,
    value,
    error,
    setError,
}: IDateSingleValueProps) => {
    const timezones = Object.values(
        TimezoneCountries.getAllTimezones({ deprecated: false }) as {
            [timezone: string]: { name: string; utcOffsetStr: string };
        },
    ).map((timezone) => ({
        key: timezone.name,
        label: `${timezone.name}`,
        utcOffset: timezone.utcOffsetStr,
    }));
    const { timeZone: localTimezoneName } =
        Intl.DateTimeFormat().resolvedOptions();
    const [pickedDate, setPickedDate] = useState(value || '');
    const inputId = useId();
    const helpId = useId();

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
        <Container>
            <label htmlFor={inputId}>
                <ScreenReaderOnly>Date</ScreenReaderOnly>
            </label>
            <StyledInput
                id={inputId}
                aria-describedby={helpId}
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
            <HelpIcon htmlTooltip tooltip={<p id={helpId}>{timezoneText}</p>} />
        </Container>
    );
};
