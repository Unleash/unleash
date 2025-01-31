import { Link, styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { subMonths } from 'date-fns';
import type { ChartDataSelection } from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import { useLocationSettings } from 'hooks/useLocationSettings';
import type { FC } from 'react';

type Props = {
    period: ChartDataSelection;
    usageTotal: number;
    includedTraffic: number;
};

const Container = styled('article')(({ theme }) => ({
    // flex: 'auto',
    minWidth: 'min-content',
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
    whiteSpace: 'nowrap',
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
    // flexFlow: 'row ',
    justifyContent: 'space-between',
    gap: theme.spacing(1, 3),
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',

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

    return `Incoming requests in ${formatMonth(new Date(period.month))}`;
};

export const RequestSummary: FC<Props> = ({
    period,
    usageTotal,
    includedTraffic,
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
                            tabIndex={-1}
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
                        <dt>Included in your plan monthly</dt>
                        <dd>
                            {includedTraffic.toLocaleString('en-US')} requests
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
                {true && (
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
