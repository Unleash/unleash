import React, { FC, VFC } from 'react';
import TimeAgo from 'react-timeago';
import { styled, Tooltip, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

function shortenUnitName(unit?: string): string {
    switch (unit) {
        case 'second':
            return 's';
        case 'minute':
            return 'm';
        case 'hour':
            return 'h';
        case 'day':
            return 'D';
        case 'week':
            return 'W';
        case 'month':
            return 'M';
        case 'year':
            return 'Y';
        default:
            return '';
    }
}

const useFeatureColor = () => {
    const theme = useTheme();

    return (unit?: string): string => {
        switch (unit) {
            case 'second':
                return theme.palette.seen.recent;
            case 'minute':
                return theme.palette.seen.recent;
            case 'hour':
                return theme.palette.seen.recent;
            case 'day':
                return theme.palette.seen.recent;
            case 'week':
                return theme.palette.seen.inactive;
            case 'month':
                return theme.palette.seen.abandoned;
            case 'year':
                return theme.palette.seen.abandoned;
            default:
                return theme.palette.seen.unknown;
        }
    };
};

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(1.5),
}));

const StyledBox = styled('div')(({ theme }) => ({
    width: '38px',
    height: '38px',
    background: theme.palette.background.paper,
    borderRadius: `${theme.shape.borderRadius}px`,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.typography.body2.fontSize,
    margin: '0 auto',
}));

interface IFeatureSeenCellProps {
    value?: string | Date | null;
}

const Wrapper: FC<{ unit?: string; tooltip: string }> = ({
    unit,
    tooltip,
    children,
}) => {
    const getColor = useFeatureColor();

    return (
        <StyledContainer>
            <Tooltip title={tooltip} arrow describeChild>
                <StyledBox style={{ background: getColor(unit) }} data-loading>
                    {children}
                </StyledBox>
            </Tooltip>
        </StyledContainer>
    );
};

export const FeatureSeenCell: VFC<IFeatureSeenCellProps> = ({
    value: lastSeenAt,
}) => {
    return (
        <ConditionallyRender
            condition={Boolean(lastSeenAt)}
            show={
                <TimeAgo
                    date={lastSeenAt!}
                    title=""
                    live={false}
                    formatter={(
                        value: number,
                        unit: string,
                        suffix: string
                    ) => {
                        return (
                            <Wrapper
                                tooltip={`Last usage reported ${value} ${unit}${
                                    value !== 1 ? 's' : ''
                                } ${suffix}`}
                                unit={unit}
                            >
                                {value}
                                {shortenUnitName(unit)}
                            </Wrapper>
                        );
                    }}
                />
            }
            elseShow={
                <Wrapper tooltip="No usage reported from connected applications">
                    &ndash;
                </Wrapper>
            }
        />
    );
};
