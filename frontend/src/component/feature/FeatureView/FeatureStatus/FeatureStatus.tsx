import { useStyles } from './FeatureStatus.styles';
import TimeAgo from 'react-timeago';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Tooltip, TooltipProps } from '@mui/material';
import React from 'react';

function generateUnit(unit?: string): string {
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

function getColor(unit?: string): string {
    switch (unit) {
        case 'second':
            return '#98E3AF';
        case 'minute':
            return '#98E3AF';
        case 'hour':
            return '#98E3AF';
        case 'day':
            return '#98E3AF';
        case 'week':
            return '#ECD875';
        case 'month':
            return '#F5A69A';
        case 'year':
            return '#F5A69A';
        default:
            return '#EDF0F1';
    }
}

interface IFeatureStatusProps {
    lastSeenAt?: string | Date | null;
    tooltipPlacement?: TooltipProps['placement'];
}

const FeatureStatus = ({
    lastSeenAt,
    tooltipPlacement,
}: IFeatureStatusProps) => {
    const { classes: styles } = useStyles();

    const Wrapper = (
        props: React.PropsWithChildren<{ color: string; toolTip: string }>
    ) => {
        return (
            <Tooltip title={props.toolTip} arrow placement={tooltipPlacement}>
                <div
                    className={styles.container}
                    style={{ background: props.color, fontSize: '0.8rem' }}
                >
                    {props.children}
                </div>
            </Tooltip>
        );
    };

    return (
        <ConditionallyRender
            condition={Boolean(lastSeenAt)}
            show={() => (
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
                                toolTip={`Last usage reported ${value} ${unit}${
                                    value !== 1 ? 's' : ''
                                } ${suffix}`}
                                color={getColor(unit)}
                            >
                                {value}
                                {generateUnit(unit)}
                            </Wrapper>
                        );
                    }}
                />
            )}
            elseShow={
                <Wrapper
                    toolTip="No usage reported from connected applications"
                    color={getColor()}
                >
                    <span style={{ fontSize: '1.4rem' }}>⊕</span>
                </Wrapper>
            }
        />
    );
};

export default FeatureStatus;
