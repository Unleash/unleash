import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';
import Input from 'component/common/Input/Input';
import { parseDateValue, parseValidDate } from 'component/common/util';
import { useTimezones } from '../../../../../../hooks/useTimezones';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { format, parseISO } from 'date-fns';

import { useEffect, useState } from 'react';
import GeneralSelect from '../../../../GeneralSelect/GeneralSelect';
import { ConditionallyRender } from '../../../../ConditionallyRender/ConditionallyRender';
interface IDateSingleValueProps {
    setValue: (value: string) => void;
    value?: string;
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
}

export const DateSingleValue = ({
    setValue,
    value,
    error,
    setError,
}: IDateSingleValueProps) => {
    const timezones = useTimezones();
    const { timeZone: local } = Intl.DateTimeFormat().resolvedOptions();
    const [timezone, setTimezone] = useState(local);
    const [pickedDate, setPickedDate] = useState(value || '');
    const [localDate, setLocalDate] = useState(pickedDate || '');

    useEffect(() => {
        if (pickedDate && timezone) {
            const utc = zonedTimeToUtc(pickedDate!, timezone);
            setValue(utc.toISOString());
            const localDate = utcToZonedTime(utc, local);
            setLocalDate(localDate.toISOString());
        }
    }, [local, pickedDate, setValue, timezone]);

    if (!value) return null;

    return (
        <>
            <ConstraintFormHeader>Select a date</ConstraintFormHeader>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginRight: 40,
                    marginBottom: 8,
                }}
            >
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
                    }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    error={Boolean(error)}
                    errorText={error}
                    required
                />
                <ConditionallyRender
                    condition={timezones.length > 0}
                    show={
                        <GeneralSelect
                            options={timezones}
                            label={'Timezone'}
                            onChange={setTimezone}
                            value={timezone}
                            sx={{ minWidth: 180 }}
                        />
                    }
                />
            </div>
            <ConditionallyRender
                condition={local !== timezone}
                show={<p>Local Time: {format(parseISO(localDate), 'PPPpp')}</p>}
            />
        </>
    );
};
