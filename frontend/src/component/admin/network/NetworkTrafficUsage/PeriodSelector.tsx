import { styled } from '@mui/material';
import type { ChartDataSelection } from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import type { FC } from 'react';

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
    borderRadius: theme.shape.borderRadiusLarge,
    border: `2px solid ${theme.palette.divider}`,
    padding: theme.spacing(3),
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(2),
    button: {
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        fontSize: theme.typography.body1.fontSize,
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadius,
        color: theme.palette.text.primary,
        transition: 'background-color 0.2s ease',

        '&.selected': {
            backgroundColor: theme.palette.secondary.light,
        },
    },
    'button:disabled': {
        cursor: 'default',
        color: theme.palette.text.disabled,
    },
    'button:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const MonthSelector = styled('article')(({ theme }) => ({
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

        marginBottom: theme.spacing(1),
    },
}));

const MonthGrid = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    padding: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    rowGap: theme.spacing(1),
    columnGap: theme.spacing(2),
}));

const RangeSelector = styled('article')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(0.5),
    h4: {
        fontSize: theme.typography.body2.fontSize,
        margin: 0,
        color: theme.palette.text.secondary,
    },
}));

const RangeList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    padding: 0,
    'li + li': {
        marginTop: theme.spacing(1),
    },

    button: {
        marginLeft: `-${theme.spacing(0.5)}`,
    },
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

type Props = {
    selectedPeriod: ChartDataSelection;
    setPeriod: (period: ChartDataSelection) => void;
};

export const PeriodSelector: FC<Props> = ({ selectedPeriod, setPeriod }) => {
    const selectablePeriods = getSelectablePeriods();

    const rangeOptions = [3, 6, 12].map((monthsBack) => ({
        value: monthsBack,
        label: `Last ${monthsBack} months`,
    }));

    return (
        <Wrapper>
            <MonthSelector>
                <hgroup>
                    <h3>Select month</h3>
                    <p>Last 12 months</p>
                </hgroup>
                <MonthGrid>
                    {selectablePeriods.map((period, index) => (
                        <li key={period.label}>
                            <button
                                className={
                                    selectedPeriod.grouping === 'daily' &&
                                    period.key === selectedPeriod.month
                                        ? 'selected'
                                        : ''
                                }
                                type='button'
                                disabled={!period.selectable}
                                onClick={() => {
                                    setPeriod({
                                        grouping: 'daily',
                                        month: period.key,
                                    });
                                }}
                            >
                                {period.shortLabel}
                            </button>
                        </li>
                    ))}
                </MonthGrid>
            </MonthSelector>
            <RangeSelector>
                <h4>Range</h4>

                <RangeList>
                    {rangeOptions.map((option) => (
                        <li key={option.label}>
                            <button
                                className={
                                    selectedPeriod.grouping === 'monthly' &&
                                    option.value === selectedPeriod.monthsBack
                                        ? 'selected'
                                        : ''
                                }
                                type='button'
                                onClick={() => {
                                    setPeriod({
                                        grouping: 'monthly',
                                        monthsBack: option.value,
                                    });
                                }}
                            >
                                Last {option.value} months
                            </button>
                        </li>
                    ))}
                </RangeList>
            </RangeSelector>
        </Wrapper>
    );
};
