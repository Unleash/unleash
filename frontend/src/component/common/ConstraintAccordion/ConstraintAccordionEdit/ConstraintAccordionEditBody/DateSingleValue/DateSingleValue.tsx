import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';
import Input from 'component/common/Input/Input';
import { parseDateValue, parseValidDate } from 'component/common/util';
import {
    ITimezoneSelect,
    useTimezones,
} from '../../../../../../hooks/useTimezones';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

import { useEffect, useMemo, useState } from 'react';
import GeneralSelect from '../../../../GeneralSelect/GeneralSelect';
import { ConditionallyRender } from '../../../../ConditionallyRender/ConditionallyRender';
import useUiConfig from '../../../../../../hooks/api/getters/useUiConfig/useUiConfig';
import { styled } from '@mui/material';

interface IDateSingleValueProps {
    setValue: (value: string) => void;
    value?: string;
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
}

const StyledWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
    gap: theme.spacing(1),
}));

export const DateSingleValue = ({
    setValue,
    value,
    error,
    setError,
}: IDateSingleValueProps) => {
    const { uiConfig } = useUiConfig();
    const showSelectableTimezone = Boolean(uiConfig.flags.selectableTimezone);
    const timezones = useTimezones();
    const { timeZone: local } = Intl.DateTimeFormat().resolvedOptions();
    const [timezone, setTimezone] = useState(local);
    const [pickedDate, setPickedDate] = useState(value || '');
    const [localDate, setLocalDate] = useState(pickedDate || '');

    const localTimezone = useMemo<ITimezoneSelect | undefined>(() => {
        return timezones.find(t => t.key === local);
    }, [timezones, local]);

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
                    }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    error={Boolean(error)}
                    errorText={error}
                    required
                />
                <ConditionallyRender
                    condition={showSelectableTimezone}
                    show={
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
                    }
                    elseShow={
                        <p>
                            {localTimezone?.key}{' '}
                            {`(UTC ${localTimezone?.utcOffset})`}
                        </p>
                    }
                />
            </StyledWrapper>
            <ConditionallyRender
                condition={local !== timezone}
                show={
                    <p>
                        {parseValidDate(localDate)?.toISOString()} (Your local
                        time)
                    </p>
                }
            />
        </>
    );
};
