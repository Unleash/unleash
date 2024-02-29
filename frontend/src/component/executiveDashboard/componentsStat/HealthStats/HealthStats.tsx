import { VFC } from 'react';
import { useThemeMode } from 'hooks/useThemeMode';
import { useTheme } from '@mui/material';

interface IHealthStatsProps {
    value?: string | number;
    healthy: number;
    stale: number;
    potentiallyStale: number;
}

export const HealthStats: VFC<IHealthStatsProps> = ({
    value,
    healthy,
    stale,
    potentiallyStale,
}) => {
    const { themeMode } = useThemeMode();
    const isDark = themeMode === 'dark';
    const theme = useTheme();

    return (
        <svg
            viewBox='0 0 268 281'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <title>Health Stats</title>
            <g filter={!isDark ? 'url(#filter0_d_22043_268578)' : undefined}>
                <circle
                    cx='134'
                    cy='129'
                    r='97'
                    fill={theme.palette.charts.health.mainCircleBackground}
                />
            </g>
            <circle
                cx='134'
                cy='129'
                r='121'
                stroke={theme.palette.charts.health.orbit}
                strokeWidth='3'
            />
            <text
                x={134}
                y={149}
                textAnchor='middle'
                fontSize={48}
                fill={theme.palette.charts.health.title}
                fontWeight={700}
            >
                {value !== undefined ? `${value}%` : 'N/A'}
            </text>
            <g filter={!isDark ? 'url(#filter1_d_22043_268578)' : undefined}>
                <circle
                    cx='206'
                    cy='58'
                    r='50'
                    fill={theme.palette.charts.health.circles}
                />
            </g>
            <text
                x={206}
                y={56}
                fill={theme.palette.charts.health.healthy}
                fontWeight={700}
                fontSize={20}
                textAnchor='middle'
            >
                {healthy || 0}
            </text>
            <text
                x={206}
                y={72}
                fill={theme.palette.charts.health.text}
                fontSize={12}
                textAnchor='middle'
            >
                Healthy
            </text>
            <g filter={!isDark ? 'url(#filter2_d_22043_268578)' : undefined}>
                <circle
                    cx='53'
                    cy='66'
                    r='41'
                    fill={theme.palette.charts.health.circles}
                />
            </g>
            <text
                x={53}
                y={65}
                fill={theme.palette.charts.health.stale}
                fontWeight={700}
                fontSize={20}
                textAnchor='middle'
            >
                {stale || 0}
            </text>
            <text
                x={53}
                y={81}
                fill={theme.palette.charts.health.text}
                fontSize={12}
                textAnchor='middle'
            >
                Stale
            </text>
            <g filter={!isDark ? 'url(#filter3_d_22043_268578)' : undefined}>
                <circle
                    cx='144'
                    cy='224'
                    r='41'
                    fill={theme.palette.charts.health.circles}
                />
            </g>
            <text
                x={144}
                y={216}
                fill={theme.palette.charts.health.potentiallyStale}
                fontWeight={700}
                fontSize={20}
                textAnchor='middle'
            >
                {potentiallyStale || 0}
            </text>
            <text
                x={144}
                y={232}
                fill={theme.palette.charts.health.text}
                fontSize={12}
                textAnchor='middle'
            >
                <tspan x={144} dy='0'>
                    Potentially
                </tspan>
                <tspan x={144} dy='1.2em'>
                    stale
                </tspan>
            </text>
            <path
                d='M99.5 247.275C99.5 251.693 103.082 255.275 107.5 255.275C111.918 255.275 115.5 251.693 115.5 247.275C115.5 242.857 111.918 239.275 107.5 239.275C103.082 239.275 99.5 242.857 99.5 247.275ZM10.8811 92C10.8811 96.4183 14.4629 100 18.8811 100C23.2994 100 26.8811 96.4183 26.8811 92C26.8811 87.5817 23.2994 84 18.8811 84C14.4629 84 10.8811 87.5817 10.8811 92ZM107.827 245.811C54.4151 233.886 14.5 186.258 14.5 129.325H11.5C11.5 187.696 52.4223 236.515 107.173 248.739L107.827 245.811ZM14.5 129.325C14.5 116.458 16.5379 104.07 20.3078 92.4634L17.4545 91.5366C13.5886 103.439 11.5 116.14 11.5 129.325H14.5Z'
                fill='url(#paint0_linear_22043_268578)'
            />
            <defs>
                <filter
                    id='filter0_d_22043_268578'
                    x='15'
                    y='13'
                    width='238'
                    height='238'
                    filterUnits='userSpaceOnUse'
                    colorInterpolationFilters='sRGB'
                >
                    <feFlood floodOpacity='0' result='BackgroundImageFix' />
                    <feColorMatrix
                        in='SourceAlpha'
                        type='matrix'
                        values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
                        result='hardAlpha'
                    />
                    <feMorphology
                        radius='2'
                        operator='dilate'
                        in='SourceAlpha'
                        result='effect1_dropShadow_22043_268578'
                    />
                    <feOffset dy='3' />
                    <feGaussianBlur stdDeviation='10' />
                    <feComposite in2='hardAlpha' operator='out' />
                    <feColorMatrix
                        type='matrix'
                        values='0 0 0 0 0.505882 0 0 0 0 0.478431 0 0 0 0 0.996078 0 0 0 0.36 0'
                    />
                    <feBlend
                        mode='normal'
                        in2='BackgroundImageFix'
                        result='effect1_dropShadow_22043_268578'
                    />
                    <feBlend
                        mode='normal'
                        in='SourceGraphic'
                        in2='effect1_dropShadow_22043_268578'
                        result='shape'
                    />
                </filter>
                <filter
                    id='filter1_d_22043_268578'
                    x='144'
                    y='0'
                    width='124'
                    height='124'
                    filterUnits='userSpaceOnUse'
                    colorInterpolationFilters='sRGB'
                >
                    <feFlood floodOpacity='0' result='BackgroundImageFix' />
                    <feColorMatrix
                        in='SourceAlpha'
                        type='matrix'
                        values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
                        result='hardAlpha'
                    />
                    <feOffset dy='4' />
                    <feGaussianBlur stdDeviation='6' />
                    <feComposite in2='hardAlpha' operator='out' />
                    <feColorMatrix
                        type='matrix'
                        values='0 0 0 0 0.380392 0 0 0 0 0.356863 0 0 0 0 0.760784 0 0 0 0.16 0'
                    />
                    <feBlend
                        mode='normal'
                        in2='BackgroundImageFix'
                        result='effect1_dropShadow_22043_268578'
                    />
                    <feBlend
                        mode='normal'
                        in='SourceGraphic'
                        in2='effect1_dropShadow_22043_268578'
                        result='shape'
                    />
                </filter>
                <filter
                    id='filter2_d_22043_268578'
                    x='0'
                    y='17'
                    width='106'
                    height='106'
                    filterUnits='userSpaceOnUse'
                    colorInterpolationFilters='sRGB'
                >
                    <feFlood floodOpacity='0' result='BackgroundImageFix' />
                    <feColorMatrix
                        in='SourceAlpha'
                        type='matrix'
                        values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
                        result='hardAlpha'
                    />
                    <feOffset dy='4' />
                    <feGaussianBlur stdDeviation='6' />
                    <feComposite in2='hardAlpha' operator='out' />
                    <feColorMatrix
                        type='matrix'
                        values='0 0 0 0 0.380392 0 0 0 0 0.356863 0 0 0 0 0.760784 0 0 0 0.16 0'
                    />
                    <feBlend
                        mode='normal'
                        in2='BackgroundImageFix'
                        result='effect1_dropShadow_22043_268578'
                    />
                    <feBlend
                        mode='normal'
                        in='SourceGraphic'
                        in2='effect1_dropShadow_22043_268578'
                        result='shape'
                    />
                </filter>
                <filter
                    id='filter3_d_22043_268578'
                    x='91'
                    y='175'
                    width='106'
                    height='106'
                    filterUnits='userSpaceOnUse'
                    colorInterpolationFilters='sRGB'
                >
                    <feFlood floodOpacity='0' result='BackgroundImageFix' />
                    <feColorMatrix
                        in='SourceAlpha'
                        type='matrix'
                        values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
                        result='hardAlpha'
                    />
                    <feOffset dy='4' />
                    <feGaussianBlur stdDeviation='6' />
                    <feComposite in2='hardAlpha' operator='out' />
                    <feColorMatrix
                        type='matrix'
                        values='0 0 0 0 0.380392 0 0 0 0 0.356863 0 0 0 0 0.760784 0 0 0 0.16 0'
                    />
                    <feBlend
                        mode='normal'
                        in2='BackgroundImageFix'
                        result='effect1_dropShadow_22043_268578'
                    />
                    <feBlend
                        mode='normal'
                        in='SourceGraphic'
                        in2='effect1_dropShadow_22043_268578'
                        result='shape'
                    />
                </filter>
                <linearGradient
                    id='paint0_linear_22043_268578'
                    x1='64.2447'
                    y1='87'
                    x2='64.2447'
                    y2='249'
                    gradientUnits='userSpaceOnUse'
                >
                    <stop
                        stopColor={theme.palette.charts.health.gradientStale}
                    />
                    <stop
                        offset='1'
                        stopColor={
                            theme.palette.charts.health.gradientPotentiallyStale
                        }
                    />
                </linearGradient>
            </defs>
        </svg>
    );
};
