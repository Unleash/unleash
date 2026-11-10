import type { FC, KeyboardEvent, ReactNode } from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { getTimezone } from 'countries-and-timezones';
import type { Theme } from '@mui/material';
import { tabsClasses } from '@mui/material/Tabs';
import { tabClasses } from '@mui/material/Tab';
import { svgIconClasses } from '@mui/material/SvgIcon';
import {
    DateTimeField,
    LocalizationProvider,
    StaticDateTimePicker,
    type StaticDateTimePickerProps,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { dateTimePickerTabsClasses } from '@mui/x-date-pickers/DateTimePicker';
import { pickersLayoutClasses } from '@mui/x-date-pickers/PickersLayout';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import { enUS } from 'date-fns/locale';
import { pickersInputSizing } from 'themes/controls.ts';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { getDateFnsLocale } from 'component/insights/getDateFnsLocale.ts';
import {
    AddValueButton,
    fieldDescribedBy,
    inputSx,
    InlineValueChrome,
} from './InlineValueChrome.tsx';
import type { SubmitValue } from './InlineValueInput.tsx';

const dateFieldSx = (theme: Theme) => {
    const sizing = pickersInputSizing({ size: 'medium' });
    return {
        ...sizing,
        '& .MuiInputLabel-root': {
            // visually hidden
            border: 0,
            clip: 'rect(0 0 0 0)',
            height: 'auto',
            margin: 0,
            overflow: 'hidden',
            padding: 0,
            position: 'absolute',
            width: '1px',
            whiteSpace: 'nowrap',
        },
        '& .MuiPickersOutlinedInput-notchedOutline legend': {
            display: 'none',
        },
        '& .MuiPickersOutlinedInput-notchedOutline': {
            top: 0,
        },
        '& .MuiPickersOutlinedInput-root': {
            ...sizing['& .MuiPickersOutlinedInput-root'],
            ...inputSx(theme),
            width: 185,
        },
    };
};

const calendarSx = {
    [`& .${tabsClasses.list}`]: {
        padding: '4px',
    },
    [`& .${dateTimePickerTabsClasses.root}`]: {
        minHeight: 'auto',
    },
    [`& .${dateTimePickerTabsClasses.root} .${tabClasses.root}`]: {
        minHeight: 32,
        padding: '6px 8px',
    },
    [`& .${dateTimePickerTabsClasses.root} .${tabClasses.root} .${svgIconClasses.root}`]:
        {
            fontSize: '1.125rem',
            margin: 0,
        },
};

type PickerView = NonNullable<StaticDateTimePickerProps['view']>;

type Props = {
    value: string;
    onChange: (value: string) => void;
    onClose: (shouldManageFocus: boolean) => void;
    submitValue: SubmitValue;
    helpText?: ReactNode;
};

const describeEl = (el: Element | null) =>
    el ? `<${el.tagName.toLowerCase()} class="${el.className}">` : 'null';

// real navigation never lands on an ancestor of the picker (<body>
// included); only MUI's dropped focus, or an outer trap rescuing it, does
const focusEscapedToMui = (active: Element | null, picker: Element | null) =>
    Boolean(active?.contains(picker));

// whichever view is active (day/month/year grid or clock) renders as a
// sibling of the tabs switcher, not inside it, regardless of which one it is
const reclaimPickerFocus = (picker: HTMLElement | null) => {
    const candidates = picker?.querySelectorAll<HTMLElement>('[tabindex="0"]');
    const target = candidates
        ? Array.from(candidates).find(
              (el) => !el.closest(`.${pickersLayoutClasses.tabs}`),
          )
        : undefined;
    console.debug(`[datepicker] reclaiming onto ${describeEl(target ?? null)}`);
    target?.focus();
    return Boolean(target);
};

const useLocalTimezoneHint = () => {
    const { timeZone: localTimezoneName } =
        Intl.DateTimeFormat().resolvedOptions();

    return useMemo<string | undefined>(() => {
        const localTimezone = getTimezone(localTimezoneName);
        return localTimezone
            ? `${localTimezoneName}, UTC ${localTimezone.utcOffsetStr}`
            : undefined;
    }, [localTimezoneName]);
};

export const ConstraintDateInput: FC<Props> = ({
    value,
    onChange,
    onClose,
    submitValue,
    helpText,
}) => {
    const [error, setError] = useState('');
    const [announcement, setAnnouncement] = useState('');
    const inputId = useId();
    const timezoneHint = useLocalTimezoneHint();
    const { locationSettings } = useLocationSettings();
    const dateFnsLocale = useMemo(() => {
        const localeFormats = getDateFnsLocale(locationSettings.locale);
        return {
            ...localeFormats,
            // Keep month/day/AM-PM names in English
            localize: enUS.localize,
            match: enUS.match,
        };
    }, [locationSettings.locale]);

    const submit = () => {
        if (!value) {
            setError('The value must be a complete date with time');
            return false;
        }
        return submitValue(value, setError, setAnnouncement);
    };

    const onFieldChange = (newValue: Date | null) => {
        setError('');
        if (!newValue || Number.isNaN(newValue.getTime())) {
            onChange('');
            return;
        }
        onChange(newValue.toISOString());
    };

    const onFieldKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            submit();
        } else if (e.key === 'Escape') {
            e.stopPropagation();
            onClose(true);
        }
    };

    // Enter submits only on the last view (minutes)
    const [pickerView, setPickerView] = useState<PickerView>('day');
    const pickerRef = useRef<HTMLDivElement>(null);

    const onViewChange = (view: PickerView) => {
        setPickerView(view);
        // MUI's TimeClock autoFocus is `!!focusedView`, unchanged across an
        // hours->minutes switch, so its own refocus effect never re-fires
        setTimeout(() => {
            if (pickerRef.current?.contains(document.activeElement)) return;
            reclaimPickerFocus(pickerRef.current);
        }, 0);
    };

    useEffect(() => {
        // react as fast as an outer trap's own synchronous rescue, rather
        // than waiting for InlineValueChrome's deferred onFocusEscape
        const onFocusIn = (e: Event) => {
            const active = e.target as Element | null;
            if (
                pickerRef.current?.contains(active) ||
                !focusEscapedToMui(active, pickerRef.current)
            )
                return;
            reclaimPickerFocus(pickerRef.current);
        };
        document.addEventListener('focusin', onFocusIn);
        return () => document.removeEventListener('focusin', onFocusIn);
    }, []);

    const onFocusEscape = () =>
        focusEscapedToMui(document.activeElement, pickerRef.current) &&
        reclaimPickerFocus(pickerRef.current);

    // v8+ splits DateTimePicker views into a date step and a time step and
    // only auto-advances within a step, so hop from day to hours ourselves
    const onPickerChange = (newValue: Date | null) => {
        onFieldChange(newValue);
        if (pickerView === 'day' && newValue) onViewChange('hours');
    };

    const onPickerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'Enter') return;
        e.stopPropagation();
        if (pickerView === 'minutes') {
            e.preventDefault();
            submit();
        }
    };

    const combinedHelpText = timezoneHint ? (
        <>
            {helpText} ({timezoneHint})
        </>
    ) : (
        helpText
    );

    const dateField = (
        <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={dateFnsLocale}
        >
            <DateTimeField
                id={inputId}
                label='Constraint Value'
                value={value ? new Date(value) : null}
                onChange={onFieldChange}
                onKeyDown={onFieldKeyDown}
                error={Boolean(error)}
                autoFocus
                size='medium'
                aria-describedby={fieldDescribedBy(inputId)}
                slotProps={{
                    textField: {
                        sx: dateFieldSx,
                        InputProps: {
                            endAdornment: (
                                <AddValueButton
                                    value={value}
                                    onClick={submit}
                                />
                            ),
                        },
                    } as {
                        sx: typeof dateFieldSx;
                        InputProps: { endAdornment: ReactNode };
                    },
                }}
            />
        </LocalizationProvider>
    );

    return (
        <InlineValueChrome
            inputId={inputId}
            value={value}
            error={error}
            announcement={announcement}
            helpText={combinedHelpText}
            onClose={onClose}
            onFocusEscape={onFocusEscape}
            submit={submit}
            field={dateField}
        >
            <div ref={pickerRef} onKeyDown={onPickerKeyDown}>
                <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={dateFnsLocale}
                >
                    <StaticDateTimePicker
                        value={value ? new Date(value) : null}
                        onChange={onPickerChange}
                        view={pickerView}
                        onViewChange={onViewChange}
                        viewRenderers={{
                            hours: renderTimeViewClock,
                            minutes: renderTimeViewClock,
                            seconds: renderTimeViewClock,
                        }}
                        sx={calendarSx}
                        slotProps={{
                            actionBar: { actions: [] },
                            toolbar: { hidden: true },
                        }}
                    />
                </LocalizationProvider>
            </div>
        </InlineValueChrome>
    );
};
