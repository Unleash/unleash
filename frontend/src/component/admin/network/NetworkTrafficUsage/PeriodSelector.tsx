import { styled } from '@mui/material';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';

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
    border: `1px solid ${theme.palette.divider}`,
    paddingInline: theme.spacing(1),
    paddingBlock: theme.spacing(2.5),
}));

const Selector = styled('fieldset')(({ theme }) => ({
    '&:focus-within': {
        bakgroundColor: 'blue',
    },
    label: {
        cursor: 'pointer',
    },
    'label:focus-within': {
        backgroundColor: 'red',
    },
    'label:has(input:checked)': {
        backgroundColor: theme.palette.secondary.light,
    },
    'label:has(input:disabled)': {
        color: theme.palette.text.disabled,
        cursor: 'default',
    },
    input: {
        display: 'none',
    },
    border: 'none',
    // borderRadius: theme.shape.borderRadiusLarge,
    // borderColor: theme.palette.divider,
    legend: {
        h3: {
            margin: 0,
            fontSize: theme.typography.h3.fontSize,
        },
        p: {
            color: theme.palette.text.secondary,
            fontSize: theme.typography.body2.fontSize,
        },
        // position: 'absolute',
        // top: '-.6em',
    },
}));

const MonthGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    rowGap: theme.spacing(1),
    columnGap: theme.spacing(2),
    label: {
        textAlign: 'center',
        padding: theme.spacing(0.2),
        borderRadius: theme.shape.borderRadius,
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

export const PeriodSelector = () => {
    const selectablePeriods = getSelectablePeriods();
    console.log(selectablePeriods);
    return (
        <Wrapper>
            <Selector>
                <legend>
                    <h3>Select month</h3>
                    <p>Last 12 months</p>
                </legend>
                <MonthGrid>
                    {selectablePeriods.map((period, index) => (
                        <label
                            key={period.label}
                            className={period.selectable ? '' : 'disabled'}
                        >
                            {period.shortLabel}
                            <ScreenReaderOnly>
                                <input
                                    type='radio'
                                    name='period'
                                    value={period.label}
                                    disabled={!period.selectable}
                                    onClick={(e) =>
                                        console.log(
                                            'clicked',
                                            e,
                                            e.target.value,
                                        )
                                    }
                                />
                            </ScreenReaderOnly>
                        </label>
                    ))}
                </MonthGrid>
            </Selector>
        </Wrapper>
    );
};
