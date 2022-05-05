import React, { FC, VFC } from 'react';
import TimeAgo from 'react-timeago';
import { Tooltip, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './FeatureSeenCell.styles';

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
                return theme.palette.success.light;
            case 'minute':
                return theme.palette.success.light;
            case 'hour':
                return theme.palette.success.light;
            case 'day':
                return theme.palette.success.light;
            case 'week':
                return theme.palette.warning.light;
            case 'month':
                return theme.palette.error.light;
            case 'year':
                return theme.palette.error.light;
            default:
                return theme.palette.grey[100];
        }
    };
};

interface IFeatureSeenCellProps {
    value?: string | Date | null;
}

const Wrapper: FC<{ unit?: string; tooltip: string }> = ({
    unit,
    tooltip,
    children,
}) => {
    const { classes: styles } = useStyles();
    const getColor = useFeatureColor();

    return (
        <Tooltip title={tooltip} arrow>
            <div
                className={styles.container}
                style={{ background: getColor(unit) }}
                data-loading
            >
                {children}
            </div>
        </Tooltip>
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
