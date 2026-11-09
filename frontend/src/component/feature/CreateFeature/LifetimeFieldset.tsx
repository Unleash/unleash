import { useId, useState } from 'react';
import { Divider, styled, TextField, Typography } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined';
import {
    addDays,
    differenceInCalendarDays,
    formatISO,
    parseISO,
} from 'date-fns';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import type { Lifetime } from 'component/feature/hooks/useFeatureForm';
import { lifetimePresets } from './flagTypes.ts';
import {
    ChoiceChip,
    ChoiceGroup,
    FieldGroup,
    Legend,
} from './CreateFeatureForm.styles.ts';

const ChipDivider = styled(Divider)(({ theme }) => ({
    height: theme.spacing(3),
    alignSelf: 'center',
}));

const DateField = styled(TextField)(({ theme }) => ({
    marginTop: theme.spacing(1.5),
    width: theme.spacing(24),
}));

const Note = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    marginTop: theme.spacing(1.5),
}));

const isoDate = (date: Date) => formatISO(date, { representation: 'date' });

const daysUntil = (date: Date) => differenceInCalendarDays(date, new Date());

const tomorrow = () => isoDate(addDays(new Date(), 1));

const selectedChoice = (lifetime: Lifetime | undefined) => {
    switch (lifetime?.type) {
        case 'preset':
            return lifetime.days;
        case 'custom':
        case 'permanent':
            return lifetime.type;
        default:
            return null;
    }
};

const expectedEndOfLifetime = (lifetime: Lifetime | undefined) => {
    switch (lifetime?.type) {
        case 'preset':
            return addDays(new Date(), lifetime.days);
        case 'custom':
            return parseISO(lifetime.endsAt);
        default:
            return undefined;
    }
};

const lifetimeNote = (lifetime: Lifetime, locale: string) => {
    const endsAt = expectedEndOfLifetime(lifetime);
    return endsAt
        ? `You'll get a reminder on ${formatDateYMD(endsAt, locale)} to clean up this flag.`
        : 'Since the flag is permanent, you will be asked to review it once a year.';
};

type LifetimeFieldsetProps = {
    lifetime: Lifetime | undefined;
    onChange: (lifetime: Lifetime) => void;
};

export const LifetimeFieldset = ({
    lifetime,
    onChange,
}: LifetimeFieldsetProps) => {
    const { locationSettings } = useLocationSettings();
    const legendId = useId();
    const [dateError, setDateError] = useState(false);
    const [lastPickedDate, setLastPickedDate] = useState(
        lifetime?.type === 'custom' ? lifetime.endsAt : undefined,
    );

    const selectChoice = (choice: number | string | null) => {
        setDateError(false);
        if (choice === 'custom') {
            onChange({ type: 'custom', endsAt: lastPickedDate ?? tomorrow() });
        } else if (choice === 'permanent') {
            onChange({ type: 'permanent' });
        } else if (choice !== null) {
            onChange({ type: 'preset', days: Number(choice) });
        }
    };

    const selectDate = (value: string) => {
        if (!value) {
            return;
        }
        const isAfterToday = daysUntil(parseISO(value)) > 0;
        setDateError(!isAfterToday);
        if (isAfterToday) {
            setLastPickedDate(value);
            onChange({ type: 'custom', endsAt: value });
        }
    };

    return (
        <FieldGroup component='fieldset'>
            <Legend component='legend' id={legendId}>
                Expected lifetime
            </Legend>
            <ChoiceGroup
                exclusive
                value={selectedChoice(lifetime)}
                onChange={(_, choice) => selectChoice(choice)}
                aria-labelledby={legendId}
            >
                {lifetimePresets.map(({ label, days }) => (
                    <ChoiceChip key={days} value={days}>
                        {label}
                    </ChoiceChip>
                ))}
                <ChoiceChip value='custom'>
                    <CalendarMonthIcon />
                    Pick a date
                </ChoiceChip>
                <ChipDivider orientation='vertical' />
                <ChoiceChip value='permanent'>Permanent</ChoiceChip>
            </ChoiceGroup>
            {lifetime?.type === 'custom' ? (
                <DateField
                    type='date'
                    size='medium'
                    defaultValue={lifetime.endsAt}
                    onChange={(event) => selectDate(event.target.value)}
                    onInvalid={(event) => event.preventDefault()}
                    error={dateError}
                    helperText={
                        dateError ? 'Pick a date after today' : undefined
                    }
                    slotProps={{
                        htmlInput: {
                            min: tomorrow(),
                            'aria-label': 'Expected lifetime end date',
                        },
                    }}
                />
            ) : null}
            {lifetime ? (
                <Note>{lifetimeNote(lifetime, locationSettings.locale)}</Note>
            ) : null}
        </FieldGroup>
    );
};
