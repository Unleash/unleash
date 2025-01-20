import { styled } from '@mui/material';
import { useState } from 'react';

export type Period = {
    key: string;
    dayCount: number;
    label: string;
    year: number;
    month: number;
    selectable: boolean;
    shortLabel: string;
};

export const toSelectablePeriod = (
    date: Date,
    label?: string,
    selectable = true,
): Period => {
    // const { locationSettings } = useLocationSettings();
    const year = date.getFullYear();
    const month = date.getMonth();
    const period = `${year}-${(month + 1).toString().padStart(2, '0')}`;
    const dayCount = new Date(year, month + 1, 0).getDate();
    return {
        key: period,
        year,
        month,
        dayCount,
        shortLabel: date.toLocaleString('en-US', {
            month: 'short',
        }),
        label:
            label ||
            date.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        selectable,
    };
};

const currentDate = new Date(Date.now());
const currentPeriod = toSelectablePeriod(currentDate, 'Current month');

const getSelectablePeriods = (): Period[] => {
    const selectablePeriods = [currentPeriod];
    for (
        let subtractMonthCount = 1;
        subtractMonthCount < 12;
        subtractMonthCount++
    ) {
        // JavaScript wraps around the year, so we don't need to handle that.
        const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - subtractMonthCount,
            1,
        );
        selectablePeriods.push(
            toSelectablePeriod(date, undefined, date > new Date('2024-03-31')),
        );
    }
    return selectablePeriods;
};

const Wrapper = styled('article')(({ theme }) => ({
    marginTop: '2rem', // temporary
    borderRadius: theme.shape.borderRadiusLarge,
    border: `2px solid ${theme.palette.divider}`,
    padding: theme.spacing(3),
}));

const MonthSelector = styled('article')(({ theme }) => ({
    button: {
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        fontSize: theme.typography.body1.fontSize,
        paddingBlock: theme.spacing(0.5),

        '&.selected': {
            backgroundColor: theme.palette.secondary.light,
        },
    },
    'button:disabled': {
        cursor: 'default',
    },
    border: 'none',
    hgroup: {
        h3: {
            margin: 0,
            fontSize: theme.typography.h3.fontSize,
        },
        p: {
            color: theme.palette.text.secondary,
            fontSize: theme.typography.body2.fontSize,
        },

        marginBottom: theme.spacing(2),
    },
}));

const MonthGrid = styled('div')(({ theme }) => ({
    // should be a list under the hood?
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    rowGap: theme.spacing(2),
    columnGap: theme.spacing(3),
    button: {
        textAlign: 'center',
        padding: theme.spacing(0.2),
        borderRadius: theme.shape.borderRadius,
    },
}));

const RangeSelector = styled('article')(({ theme }) => ({
    // border: 'none' // just something
}));

type Selection =
    | {
          type: 'month';
          value: string;
      }
    | {
          type: 'range';
          monthsBack: number;
      };

export const PeriodSelector = () => {
    const selectablePeriods = getSelectablePeriods();
    const [selection, setSelection] = useState<
        { type: 'month'; value: string } | { type: 'range'; value: number }
    >({
        type: 'month',
        value: currentPeriod.key,
    });

    const rangeOptions = [3, 6, 12].map((monthsBack) => ({
        value: monthsBack,
        label: `Last ${monthsBack} months`,
    }));

    console.log(rangeOptions);

    return (
        <Wrapper>
            <MonthSelector>
                <hgroup>
                    <h3>Select month</h3>
                    <p>Last 12 months</p>
                </hgroup>
                <MonthGrid>
                    {selectablePeriods.map((period, index) => (
                        <button
                            className={
                                period.key === selection.value ? 'selected' : ''
                            }
                            type='button'
                            key={period.label}
                            disabled={!period.selectable}
                            onClick={() => {
                                setSelection({
                                    type: 'month',
                                    value: period.key,
                                });
                            }}
                        >
                            {period.shortLabel}
                        </button>
                    ))}
                </MonthGrid>
            </MonthSelector>
            <RangeSelector>
                <h4>Range</h4>

                <ul>
                    {rangeOptions.map((option) => (
                        <li key={option.label}>
                            <button
                                type='button'
                                onClick={() => {
                                    setSelection({
                                        type: 'range',
                                        value: option.value,
                                    });
                                }}
                            >
                                Last {option.value} months
                            </button>
                        </li>
                    ))}
                </ul>
            </RangeSelector>
        </Wrapper>
    );
};
