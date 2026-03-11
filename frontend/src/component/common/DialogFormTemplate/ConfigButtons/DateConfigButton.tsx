import { type FC, useRef, useState } from 'react';
import { Button, Popover } from '@mui/material';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ButtonLabel, StyledTooltipContent } from './ConfigButton.styles';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { parseISO, isValid } from 'date-fns';
import type { ReactNode } from 'react';

type DateConfigButtonProps = {
    label: string;
    icon: ReactNode;
    labelWidth?: string;
    value: string | null;
    onChange: (date: string | null) => void;
    tooltip: {
        header: string;
        description: string;
    };
    disabled?: boolean;
};

export const DateConfigButton: FC<DateConfigButtonProps> = ({
    label,
    icon,
    labelWidth,
    value,
    onChange,
    tooltip,
    disabled,
}) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);

    const parsedDate = value ? parseISO(value) : null;
    const validDate = parsedDate && isValid(parsedDate) ? parsedDate : null;

    return (
        <>
            <TooltipResolver
                titleComponent={
                    <StyledTooltipContent>
                        <h3>{tooltip.header}</h3>
                        <p>{tooltip.description}</p>
                    </StyledTooltipContent>
                }
                variant='custom'
            >
                <Button
                    ref={buttonRef}
                    variant={value ? 'contained' : 'outlined'}
                    color='primary'
                    startIcon={icon}
                    onClick={() => setOpen(true)}
                    disableElevation
                    disabled={disabled}
                >
                    <ButtonLabel labelWidth={labelWidth}>{label}</ButtonLabel>
                </Button>
            </TooltipResolver>
            <Popover
                open={open}
                anchorEl={buttonRef.current}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateCalendar
                        value={validDate}
                        onChange={(date) => {
                            onChange(date ? date.toISOString() : null);
                            setOpen(false);
                        }}
                    />
                </LocalizationProvider>
            </Popover>
        </>
    );
};
