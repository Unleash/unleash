import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';
import Input from 'component/common/Input/Input';
import { parseDateValue, parseValidDate } from 'component/common/util';

import { useMemo, useState } from 'react';
import { ISelectOption } from 'component/common/GeneralSelect/GeneralSelect';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { styled } from '@mui/material';
import TimezoneCountries from 'countries-and-timezones';

interface ITimezoneSelect extends ISelectOption {
    utcOffset: string;
}
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

export const DateSingleValue = ({
    setValue,
    value,
    error,
    setError,
}: IDateSingleValueProps) => {
    const timezones = Object.values(
        TimezoneCountries.getAllTimezones({ deprecated: false })
    ).map(timezone => ({
        key: timezone.name,
        label: `${timezone.name}`,
        utcOffset: timezone.utcOffsetStr,
    }));
    const { timeZone: localTimezoneName } =
        Intl.DateTimeFormat().resolvedOptions();
    const [pickedDate, setPickedDate] = useState(value || '');

    const localTimezone = useMemo<ITimezoneSelect | undefined>(() => {
        return timezones.find(t => t.key === localTimezoneName);
    }, [timezones, localTimezoneName]);

    if (!value) return null;

    return (
        <>
            <ConstraintFormHeader>Select a date</ConstraintFormHeader>
            <StyledWrapper>
                <Input
                    id="date"
                    label="Date"
                    type="datetime-local"
                    value={parseDateValue(pickedDate)}
                    onChange={e => {
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
                <ConditionallyRender
                    condition={Boolean(localTimezone)}
                    show={
                        <p>
                            {localTimezone?.key}{' '}
                            {`(UTC ${localTimezone?.utcOffset})`}
                        </p>
                    }
                    elseShow={
                        <p>
                            The time shown is in your local time zone according
                            to your browser.
                        </p>
                    }
                />
            </StyledWrapper>
        </>
    );
};
