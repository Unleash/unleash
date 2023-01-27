import { ConstraintFormHeader } from '../ConstraintFormHeader/ConstraintFormHeader';
import Input from 'component/common/Input/Input';
import { parseDateValue, parseValidDate } from 'component/common/util';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

import { useEffect, useMemo, useState } from 'react';
import GeneralSelect, {
    ISelectOption,
} from 'component/common/GeneralSelect/GeneralSelect';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
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
    const { uiConfig } = useUiConfig();
    const showSelectableTimezone = Boolean(uiConfig.flags.selectableTimezone);
    const timezones = Object.values(
        TimezoneCountries.getAllTimezones({ deprecated: false })
    ).map(timezone => ({
        key: timezone.name,
        label: `${timezone.name}`,
        utcOffset: timezone.utcOffsetStr,
    }));
    const { timeZone: localTimezoneName } =
        Intl.DateTimeFormat().resolvedOptions();
    const [timezone, setTimezone] = useState(localTimezoneName);
    const [pickedDate, setPickedDate] = useState(value || '');
    const [localDate, setLocalDate] = useState(pickedDate || '');

    const localTimezone = useMemo<ITimezoneSelect | undefined>(() => {
        return timezones.find(t => t.key === localTimezoneName);
    }, [timezones, localTimezoneName]);

    useEffect(() => {
        if (pickedDate && timezone) {
            const utc = zonedTimeToUtc(pickedDate!, timezone);
            setValue(utc.toISOString());
            const localDate = utcToZonedTime(utc, localTimezoneName);
            setLocalDate(localDate.toISOString());
        }
    }, [localTimezoneName, pickedDate, setValue, timezone]);

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
                        <ConditionallyRender
                            condition={Boolean(localTimezone)}
                            show={
                                <p>
                                    {localTimezone?.key}{' '}
                                    {`(UTC ${localTimezone?.utcOffset})`}
                                </p>
                            }
                            elseShow={<p>No timezone information available</p>}
                        />
                    }
                />
            </StyledWrapper>
            <ConditionallyRender
                condition={
                    showSelectableTimezone && localTimezoneName !== timezone
                }
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
