import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import type { UnknownFlag } from './hooks/useUnknownFlags.js';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { formatDateYMDHMS } from 'utils/formatDate.js';
import { useLocationSettings } from 'hooks/useLocationSettings.js';
import { styled } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter.js';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext.js';

const REPORT_APP_LIMIT = 20;
const REPORT_ENV_LIMIT = 10;

const StyledTooltip = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledReport = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    '& > ul': {
        padding: theme.spacing(0, 3),
        margin: 0,
    },
}));

interface IUnknownFlagsLastReportedCellProps {
    row: { original: UnknownFlag };
}

const UnknownFlagsLastReportedCellTooltip = ({
    unknownFlag,
    searchQuery,
}: {
    unknownFlag: UnknownFlag;
    searchQuery: string;
}) => {
    const { locationSettings } = useLocationSettings();
    const lastReported = formatDateYMDHMS(
        unknownFlag.lastSeenAt,
        locationSettings.locale,
    );

    return (
        <StyledTooltip>
            Last reported: {lastReported}
            {unknownFlag.reports
                .slice(0, REPORT_APP_LIMIT)
                .map(({ appName, environments }) => (
                    <StyledReport key={appName}>
                        <b>
                            <Highlighter search={searchQuery}>
                                {appName}
                            </Highlighter>
                        </b>
                        <ul>
                            {environments
                                .slice(0, REPORT_ENV_LIMIT)
                                .map(({ environment, seenAt }) => (
                                    <li key={environment}>
                                        <Highlighter search={searchQuery}>
                                            {environment}
                                        </Highlighter>
                                        :{' '}
                                        {formatDateYMDHMS(
                                            seenAt,
                                            locationSettings.locale,
                                        )}
                                    </li>
                                ))}
                            {environments.length > REPORT_ENV_LIMIT && (
                                <li>
                                    and {environments.length - REPORT_ENV_LIMIT}{' '}
                                    more
                                </li>
                            )}
                        </ul>
                    </StyledReport>
                ))}
            {unknownFlag.reports.length > REPORT_APP_LIMIT && (
                <span>
                    and {unknownFlag.reports.length - REPORT_APP_LIMIT} more
                </span>
            )}
        </StyledTooltip>
    );
};

export const UnknownFlagsLastReportedCell = ({
    row,
}: IUnknownFlagsLastReportedCellProps) => {
    const { original: unknownFlag } = row;
    const { searchQuery } = useSearchHighlightContext();

    const searchableAppNames = Array.from(
        new Set(
            unknownFlag.reports.map((report) => report.appName.toLowerCase()),
        ),
    ).join('\n');
    const searchableEnvironments = Array.from(
        new Set(
            unknownFlag.reports.flatMap((report) =>
                report.environments.map((env) => env.environment.toLowerCase()),
            ),
        ),
    ).join('\n');

    return (
        <TextCell>
            <TooltipLink
                tooltip={
                    <UnknownFlagsLastReportedCellTooltip
                        unknownFlag={unknownFlag}
                        searchQuery={searchQuery}
                    />
                }
                highlighted={
                    searchQuery.length > 0 &&
                    (searchableAppNames.includes(searchQuery.toLowerCase()) ||
                        searchableEnvironments.includes(
                            searchQuery.toLowerCase(),
                        ))
                }
            >
                <TimeAgo date={unknownFlag.lastSeenAt} />
            </TooltipLink>
        </TextCell>
    );
};
