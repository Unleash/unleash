import { useId } from 'react';
import { Divider, styled, Typography } from '@mui/material';
import { addDays } from 'date-fns';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import { lifetimePresets, permanentLifetime } from './flagTypes.ts';
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

const Note = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    marginTop: theme.spacing(1.5),
}));

const lifetimeNote = (days: number, locale: string) =>
    days === permanentLifetime
        ? 'Since the flag is permanent, you will be asked to review it once a year.'
        : `You'll get a reminder on ${formatDateYMD(addDays(new Date(), days), locale)} to clean up this flag.`;

type LifetimeFieldsetProps = {
    lifetimeDays: number | undefined;
    onChange: (days: number) => void;
};

export const LifetimeFieldset = ({
    lifetimeDays,
    onChange,
}: LifetimeFieldsetProps) => {
    const { locationSettings } = useLocationSettings();
    const legendId = useId();

    return (
        <FieldGroup component='fieldset'>
            <Legend component='legend' id={legendId}>
                Expected lifetime
            </Legend>
            <ChoiceGroup
                exclusive
                value={lifetimeDays ?? null}
                onChange={(_, days: number | null) => {
                    if (days !== null) {
                        onChange(days);
                    }
                }}
                aria-labelledby={legendId}
            >
                {lifetimePresets.map(({ label, days }) => (
                    <ChoiceChip key={days} value={days}>
                        {label}
                    </ChoiceChip>
                ))}
                <ChipDivider orientation='vertical' />
                <ChoiceChip value={permanentLifetime}>Permanent</ChoiceChip>
            </ChoiceGroup>
            {lifetimeDays === undefined ? null : (
                <Note>
                    {lifetimeNote(lifetimeDays, locationSettings.locale)}
                </Note>
            )}
        </FieldGroup>
    );
};
