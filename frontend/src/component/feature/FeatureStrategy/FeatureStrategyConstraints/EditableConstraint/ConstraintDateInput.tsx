import Input from 'component/common/Input/Input';
import { parseDateValue, parseValidDate } from 'component/common/util';

import { useId, useMemo, useState } from 'react';
import { styled } from '@mui/material';
import { getAllTimezones } from 'countries-and-timezones';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import type { ConstraintValidatorOutput } from './ConstraintValidatorOutput.ts';

interface IDateSingleValueProps {
    setValue: (value: string) => void;
    value?: string;
    validator: (value: string) => ConstraintValidatorOutput;
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
    validator,
}: IDateSingleValueProps) => {
    const [error, setError] = useState('');
    const timezones = Object.values(
        getAllTimezones({ deprecated: false }) as {
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
                    if (!dateString) {
                        setError('Invalid date format');
                    } else {
                        setPickedDate(dateString);

                        const [isValid, errorMessage] = validator(dateString);
                        if (isValid) {
                            dateString && setValue(dateString);
                        } else {
                            setError(errorMessage);
                        }
                    }
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
