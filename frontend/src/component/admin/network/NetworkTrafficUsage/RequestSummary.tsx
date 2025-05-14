import { Link, styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { subMonths } from 'date-fns';
import { useLocationSettings } from 'hooks/useLocationSettings';
import type { FC } from 'react';
import type { ChartDataSelection } from './chart-data-selection.ts';
import { parseMonthString } from './dates.ts';

type Props = {
    period: ChartDataSelection;
    usageTotal: number;
    includedTraffic: number;
    purchasedTraffic: number;
    currentMonth: boolean;
};

const Container = styled('article')(({ theme }) => ({
    minWidth: '200px',
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const Header = styled('h3')(({ theme }) => ({
    margin: 0,
    fontSize: theme.typography.body1.fontSize,
}));

const List = styled('dl')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    padding: 0,
    margin: 0,
}));

const Row = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-between',
    gap: theme.spacing(1, 3),
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,

    '& dd': {
        margin: 0,
        color: theme.palette.text.primary,
    },
}));

const incomingRequestsText = (period: ChartDataSelection): string => {
    const formatMonth = (date: Date) =>
        date.toLocaleString('en-US', {
            month: 'short',
            year: 'numeric',
        });

    if (period.grouping === 'monthly') {
        const currentMonth = new Date();
        const fromMonth = subMonths(currentMonth, period.monthsBack);
        const toMonth = subMonths(currentMonth, 1);
        return `Average requests from ${formatMonth(fromMonth)} to ${formatMonth(toMonth)}`;
    }

    return `Requests used in ${formatMonth(parseMonthString(period.month))}`;
};

export const RequestSummary: FC<Props> = ({
    period,
    usageTotal,
    includedTraffic,
    purchasedTraffic,
    currentMonth,
}) => {
    const { locationSettings } = useLocationSettings();

    return (
        <Container>
            <Header>Number of requests to Unleash</Header>
            <List>
                <Row>
                    <dt>{incomingRequestsText(period)}</dt>
                    <dd>
                        <Badge
                            color={
                                includedTraffic > 0
                                    ? usageTotal <= includedTraffic
                                        ? 'success'
                                        : 'error'
                                    : 'neutral'
                            }
                        >
                            {usageTotal.toLocaleString(
                                locationSettings.locale ?? 'en-US',
                            )}{' '}
                            requests
                        </Badge>
                    </dd>
                </Row>
                {includedTraffic > 0 && (
                    <Row>
                        <dt>Included in your plan</dt>
                        <dd>
                            {includedTraffic.toLocaleString('en-US')} requests
                        </dd>
                    </Row>
                )}
                {purchasedTraffic > 0 && currentMonth && (
                    <Row>
                        <dt>Additional traffic purchased</dt>
                        <dd>
                            {purchasedTraffic.toLocaleString('en-US')} requests
                        </dd>
                    </Row>
                )}
                {includedTraffic > 0 && currentMonth && (
                    <Row>
                        <dt>Total traffic available</dt>
                        <dd>
                            {(
                                includedTraffic + purchasedTraffic
                            ).toLocaleString('en-US')}{' '}
                            requests
                        </dd>
                    </Row>
                )}
            </List>
        </Container>
    );
};

type OverageProps = {
    overages: number;
    overageCost: number;
    estimatedMonthlyCost: number;
};

export const OverageInfo: FC<OverageProps> = ({
    overages,
    overageCost,
    estimatedMonthlyCost,
}) => {
    return (
        <Container>
            <Header>Accrued traffic charges</Header>
            <List>
                <Row>
                    <dt>
                        Request overages this month (
                        <Link href='https://www.getunleash.io/pricing'>
                            pricing
                        </Link>
                        )
                    </dt>
                    <dd>{overages.toLocaleString()} requests</dd>
                </Row>
                <Row>
                    <dt>Accrued traffic charges</dt>
                    <dd>
                        <Badge color='secondary'>{overageCost} USD</Badge>
                    </dd>
                </Row>
                {estimatedMonthlyCost > 0 && (
                    <Row>
                        <dt>Estimated charges based on current usage</dt>
                        <dd>
                            <Badge color='secondary'>
                                {estimatedMonthlyCost} USD
                            </Badge>
                        </dd>
                    </Row>
                )}
            </List>
        </Container>
    );
};
