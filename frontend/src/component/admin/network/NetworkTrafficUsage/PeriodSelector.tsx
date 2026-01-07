import { styled, Button, Popover, Box, type Theme } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useRef, useState, type FC } from 'react';
import { format } from 'date-fns';
import type { ChartDataSelection } from './chart-data-selection.ts';
import { selectablePeriods } from './selectable-periods.ts';
import { parseMonthString } from './dates.ts';

const dropdownWidth = '15rem';
const dropdownInlinePadding = (theme: Theme) => theme.spacing(3);

const BaseButton = styled('button', {
    shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
    cursor: 'pointer',
    border: 'none',
    backgroundColor: selected ? theme.palette.secondary.light : 'inherit',
    fontSize: theme.typography.body1.fontSize,
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.primary,
    transition: 'background-color 0.2s ease',

    ':focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
    },
    ':hover:not(:disabled)': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const GridButton = styled(BaseButton)(({ theme }) => ({
    ':disabled': {
        cursor: 'default',
        color: theme.palette.text.disabled,
    },
}));

const RangeButton = styled(BaseButton)(({ theme }) => ({
    width: '100%',
    paddingBlock: theme.spacing(1),
    textAlign: 'left',
    borderRadius: 0,
    paddingInline: dropdownInlinePadding(theme),
}));

const SelectorDropdownButton = styled(Button)(({ theme }) => ({
    whiteSpace: 'nowrap',
    width: dropdownWidth,
    justifyContent: 'space-between',
    fontWeight: 'normal',
    color: theme.palette.text.primary,
    borderColor: theme.palette.divider,
    ':focus-within': {
        borderColor: theme.palette.primary.main,
    },
    ':hover': {
        borderColor: theme.palette.text.disabled,
        backgroundColor: 'inherit',
    },

    transition: 'border-color 0.1s ease',
}));

const Wrapper = styled('article')(({ theme }) => ({
    width: dropdownWidth,
    paddingBlock: theme.spacing(2),
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(2),
}));

const MonthSelector = styled('article')(({ theme }) => ({
    paddingInline: dropdownInlinePadding(theme),
}));

const MonthSelectorHeaderGroup = styled('hgroup')(({ theme }) => ({
    h3: {
        margin: 0,
        fontSize: theme.typography.h3.fontSize,
    },
    p: {
        color: theme.palette.text.secondary,
        fontSize: theme.typography.body2.fontSize,
    },
}));

const MonthGrid = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    padding: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    rowGap: theme.spacing(1),
}));

const RangeSelector = styled('article')(({ theme }) => ({
    display: 'flex',
    width: '100%',
    flexFlow: 'column',
    gap: theme.spacing(0.5),
}));

const RangeHeader = styled('p')(({ theme }) => ({
    paddingInline: dropdownInlinePadding(theme),
    fontSize: theme.typography.body2.fontSize,
    margin: 0,
    color: theme.palette.text.secondary,
    fontWeight: 'bold',
}));

const RangeList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    margin: 0,
    padding: 0,
    width: '100%',
    li: {
        width: '100%',
    },
}));

type Props = {
    selectedPeriod: ChartDataSelection;
    setPeriod: (period: ChartDataSelection) => void;
};

const StyledPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: theme.shape.borderRadiusLarge,
        border: `1px solid ${theme.palette.divider}`,
    },
}));

export const PeriodSelector: FC<Props> = ({ selectedPeriod, setPeriod }) => {
    const rangeOptions = [3, 6, 12].map((monthsBack) => ({
        value: monthsBack,
        label: `Last ${monthsBack} months`,
    }));

    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selectPeriod = (period: ChartDataSelection) => {
        setPeriod(period);
        setOpen(false);
    };

    const buttonText =
        selectedPeriod.grouping === 'daily'
            ? selectedPeriod.month === format(new Date(), 'yyyy-MM')
                ? 'Current month'
                : parseMonthString(selectedPeriod.month).toLocaleDateString(
                      'en-US',
                      {
                          month: 'long',
                          year: 'numeric',
                      },
                  )
            : `Last ${selectedPeriod.monthsBack} months`;

    return (
        <Box ref={ref}>
            <SelectorDropdownButton
                endIcon={open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                variant='outlined'
                disableRipple
                onClick={() => setOpen(true)}
            >
                {buttonText}
            </SelectorDropdownButton>
            <StyledPopover
                open={open}
                anchorEl={ref.current}
                onClose={() => setOpen(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Wrapper>
                    <MonthSelector>
                        <MonthSelectorHeaderGroup>
                            <h3>Select month</h3>
                            <p>Last 12 months</p>
                        </MonthSelectorHeaderGroup>
                        <MonthGrid>
                            {selectablePeriods.map((period) => (
                                <li key={period.label}>
                                    <GridButton
                                        selected={
                                            selectedPeriod.grouping ===
                                                'daily' &&
                                            period.key === selectedPeriod.month
                                        }
                                        disabled={!period.selectable}
                                        onClick={() => {
                                            selectPeriod({
                                                grouping: 'daily',
                                                month: period.key,
                                            });
                                        }}
                                    >
                                        {period.shortLabel}
                                    </GridButton>
                                </li>
                            ))}
                        </MonthGrid>
                    </MonthSelector>
                    <RangeSelector>
                        <RangeHeader>Range</RangeHeader>

                        <RangeList>
                            {rangeOptions.map((option) => (
                                <li key={option.label}>
                                    <RangeButton
                                        selected={
                                            selectedPeriod.grouping ===
                                                'monthly' &&
                                            option.value ===
                                                selectedPeriod.monthsBack
                                        }
                                        type='button'
                                        onClick={() => {
                                            selectPeriod({
                                                grouping: 'monthly',
                                                monthsBack: option.value,
                                            });
                                        }}
                                    >
                                        Last {option.value} months
                                    </RangeButton>
                                </li>
                            ))}
                        </RangeList>
                    </RangeSelector>
                </Wrapper>{' '}
            </StyledPopover>
        </Box>
    );
};
