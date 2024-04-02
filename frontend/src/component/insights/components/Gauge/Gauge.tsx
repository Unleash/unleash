import { Fragment, type VFC } from 'react';
import { Box, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInRadians: number,
) => {
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
};

const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);

const normalizeValue = (value: number, min: number, max: number) =>
    (value - min) / (max - min);

const describeArc = (radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(0, 0, radius, endAngle);
    const end = polarToCartesian(0, 0, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';
    const dSvgAttribute = [
        'M',
        start.x,
        start.y,
        'A',
        radius,
        radius,
        0,
        largeArcFlag,
        0,
        end.x,
        end.y,
    ].join(' ');
    return dSvgAttribute;
};

const GaugeLines = () => {
    const theme = useTheme();
    const startRadius = 0.875;
    const endRadius = 1.14;
    const lineWidth = 0.1;
    const lineBorder = 0.05;

    const angles = [180 + 50, 180 + 90 + 40];

    return (
        <>
            {angles.map(degreesToRadians).map((angle) => {
                const start = polarToCartesian(0, 0, startRadius, angle);
                const end = polarToCartesian(0, 0, endRadius, angle);

                return (
                    <Fragment key={angle}>
                        <path
                            d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                            fill='none'
                            stroke={theme.palette.background.paper}
                            strokeWidth={lineWidth}
                            strokeLinecap='round'
                        />
                        <path
                            d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                            fill='none'
                            stroke={theme.palette.charts.gauge.sectionLine}
                            strokeWidth={lineWidth - lineBorder}
                            strokeLinecap='round'
                        />
                    </Fragment>
                );
            })}
        </>
    );
};

const GaugeText = () => {
    const fontSize = 0.175;

    return (
        <>
            <text
                x={0}
                y={0}
                transform='translate(-1.15 -0.5) rotate(-65)'
                textAnchor='middle'
                fontSize={fontSize}
                fill='currentColor'
            >
                Slow
            </text>
            <text
                textAnchor='middle'
                transform='translate(0 -1.25)'
                fontSize={fontSize}
                fill='currentColor'
            >
                Medium
            </text>
            <text
                transform='translate(1.15 -0.5) rotate(65)'
                textAnchor='middle'
                fontSize={fontSize}
                fill='currentColor'
            >
                Fast
            </text>
        </>
    );
};

type GaugeProps = {
    value?: number;
    min?: number;
    max?: number;
};

export const Gauge: VFC<GaugeProps> = ({ value, min = 0, max = 100 }) => {
    const theme = useTheme();
    const radius = 1;
    const lineWidth = 0.25;
    const startAngle = -Math.PI;
    const endAngle = 0;

    // Calculate the filled arc proportion based on the value
    const valueAngle =
        startAngle +
        (endAngle - startAngle) * normalizeValue(value || 0, min, max);

    const backgroundArcPath = describeArc(radius, startAngle, endAngle);
    const filledArcPath = describeArc(radius, startAngle, valueAngle);

    return (
        <Box
            style={{ textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}
            sx={{ color: theme.palette.charts.gauge.text }}
        >
            <svg
                width='250'
                height='150'
                viewBox={[-1.5, -1.5, 3, 1.5].join(' ')}
                style={{ overflow: 'visible' }}
            >
                <title>Gauge chart for time to production</title>
                <defs>
                    <linearGradient
                        id='Gauge__gradient'
                        gradientUnits='userSpaceOnUse'
                        x1='-1'
                        x2='1'
                        y1='0'
                        y2='0'
                        gradientTransform='rotate(-45)'
                    >
                        <stop
                            offset='0%'
                            stopColor={theme.palette.charts.gauge.gradientStart}
                        />
                        <stop
                            offset='100%'
                            stopColor={theme.palette.charts.gauge.gradientEnd}
                        />
                    </linearGradient>
                </defs>
                <path
                    d={backgroundArcPath}
                    fill='none'
                    stroke={theme.palette.charts.gauge.background}
                    strokeWidth={lineWidth - 0.01}
                    strokeLinecap='round'
                />
                <ConditionallyRender
                    condition={value !== undefined}
                    show={
                        <path
                            d={filledArcPath}
                            fill='none'
                            stroke='url(#Gauge__gradient)'
                            strokeWidth={lineWidth}
                            strokeLinecap='round'
                        />
                    }
                />
                <GaugeLines />
                <GaugeText />
            </svg>
        </Box>
    );
};
