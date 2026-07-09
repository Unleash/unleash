import { styled, useTheme } from '@mui/material';
import type { DemoLook } from './demoModel.js';

const SKIN_TONES = ['#F6C9A0', '#EAB08C', '#C98D64', '#9C6B43', '#6E4A2E'];

// Realistic hair shades: black, dark brown, brown, chestnut, auburn, copper
// red, blond, grey.
const HAIR_COLORS = [
    '#26201C',
    '#3B2E25',
    '#5B4232',
    '#8C5A33',
    '#A5623C',
    '#B04A2A',
    '#C9A227',
    '#8A8F98',
];

const SHIRT_COLORS = [
    '#6C65E5',
    '#4A90D9',
    '#3DA382',
    '#E2764C',
    '#D9558C',
    '#4FB3BF',
    '#9A7BD6',
    '#E0A63F',
];

/**
 * Cap on the per-character transition delay so the tail of the crowd doesn't
 * lag noticeably behind a slider drag.
 */
const MAX_STAGGER_MS = 400;
const STAGGER_STEP_MS = 18;

const StyledSvg = styled('svg', {
    shouldForwardProp: (prop) =>
        !['raised', 'delayMs'].includes(prop as string),
})<{ raised: boolean; delayMs: number }>(({ theme, raised, delayMs }) => ({
    display: 'block',
    width: '100%',
    height: 'auto',
    overflow: 'visible',
    filter: raised ? 'grayscale(0)' : 'grayscale(0.9)',
    opacity: raised ? 1 : 0.5,
    transform: raised ? 'translateY(0)' : 'translateY(2px) scale(0.96)',
    transition: theme.transitions.create(['filter', 'opacity', 'transform'], {
        duration: theme.transitions.duration.short,
    }),
    transitionDelay: `${delayMs}ms`,
    '& .demo-character-arm': {
        transition: theme.transitions.create(['transform'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeOut,
        }),
        transitionDelay: `${delayMs}ms`,
    },
    // Shirt colours crossfade instead of snapping, so gaining/losing a variant
    // colour mid-rollout-drag doesn't flicker.
    '& .demo-character-shirt': {
        transition: theme.transitions.create(['fill'], {
            duration: theme.transitions.duration.shorter,
        }),
    },
    '& .demo-character-sleeve': {
        transition: theme.transitions.create(['stroke'], {
            duration: theme.transitions.duration.shorter,
        }),
    },
    '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
        transitionDelay: '0ms',
        '& .demo-character-arm, & .demo-character-shirt, & .demo-character-sleeve':
            {
                transition: 'none',
                transitionDelay: '0ms',
            },
    },
}));

const hairFor = (style: number, color: string) => {
    const cap = (
        <path
            d='M23 14 A 10.5 10.5 0 0 1 41 14'
            stroke={color}
            strokeWidth={5.5}
            strokeLinecap='round'
            fill='none'
        />
    );
    switch (style % 6) {
        case 0:
            return cap;
        case 1:
            return (
                <>
                    {cap}
                    <circle cx={32} cy={5.5} r={3.5} fill={color} />
                </>
            );
        case 2:
            return (
                <>
                    {cap}
                    <path
                        d='M41 13 q1.5 4.5 0.5 8'
                        stroke={color}
                        strokeWidth={4}
                        strokeLinecap='round'
                        fill='none'
                    />
                </>
            );
        case 3:
            return (
                <>
                    <circle cx={25} cy={10.5} r={3.8} fill={color} />
                    <circle cx={32} cy={8} r={4.2} fill={color} />
                    <circle cx={39} cy={10.5} r={3.8} fill={color} />
                </>
            );
        case 4:
            return (
                <>
                    {cap}
                    <path
                        d='M23.5 13 q-3 8 -1.5 14'
                        stroke={color}
                        strokeWidth={5}
                        strokeLinecap='round'
                        fill='none'
                    />
                    <path
                        d='M40.5 13 q3 8 1.5 14'
                        stroke={color}
                        strokeWidth={5}
                        strokeLinecap='round'
                        fill='none'
                    />
                </>
            );
        default:
            // Bald - some of the crowd simply has no hair.
            return null;
    }
};

interface IDemoCharacterProps {
    look: DemoLook;
    /** Enabled users raise a hand and get their colours back. */
    raised: boolean;
    /**
     * Forces a smile even when not raised - e.g. relieved users right after a
     * buggy feature was killed. By default only raised users smile.
     */
    happy?: boolean;
    /** Overrides the user's own shirt colour (used for variant colouring). */
    shirtColor?: string;
    /** Short letter drawn on the shirt (the user's variant). */
    badge?: string;
    /** Grid position; staggers transitions into a wave across the crowd. */
    index?: number;
}

/**
 * A small illustrated person for the quick-tour crowd. State is signalled by
 * posture, not colour alone: enabled users raise a hand and smile, disabled
 * users stand arms-down in greyscale.
 */
export const DemoCharacter = ({
    look,
    raised,
    happy = false,
    shirtColor,
    badge,
    index = 0,
}: IDemoCharacterProps) => {
    const theme = useTheme();
    const smiling = raised || happy;
    const skin = SKIN_TONES[look.skin % SKIN_TONES.length];
    const hairColor = HAIR_COLORS[look.hairColor % HAIR_COLORS.length];
    const shirt = shirtColor ?? SHIRT_COLORS[look.shirt % SHIRT_COLORS.length];
    const delayMs = Math.min(index * STAGGER_STEP_MS, MAX_STAGGER_MS);

    return (
        <StyledSvg
            viewBox='0 0 64 64'
            raised={raised}
            delayMs={delayMs}
            aria-hidden
            focusable='false'
        >
            {/* static arm */}
            <path
                className='demo-character-sleeve'
                d='M17 36 L11 50'
                stroke={shirt}
                strokeWidth={6}
                strokeLinecap='round'
            />
            <circle cx={11} cy={50} r={2.8} fill={skin} />

            {/* animated arm; pivots at the shoulder to raise the hand */}
            <g
                className='demo-character-arm'
                style={{
                    transformOrigin: '47px 36px',
                    transform: raised ? 'rotate(-140deg)' : 'rotate(0deg)',
                }}
            >
                <path
                    className='demo-character-sleeve'
                    d='M47 36 L53 50'
                    stroke={shirt}
                    strokeWidth={6}
                    strokeLinecap='round'
                />
                <circle cx={53} cy={50} r={2.8} fill={skin} />
            </g>

            {/* body */}
            <rect
                className='demo-character-shirt'
                x={19}
                y={30}
                width={26}
                height={32}
                rx={10}
                fill={shirt}
            />
            {badge ? (
                <text
                    x={32}
                    y={49}
                    textAnchor='middle'
                    fontSize={13}
                    fontWeight={700}
                    fill={theme.palette.getContrastText(shirt)}
                    style={{ userSelect: 'none' }}
                >
                    {badge}
                </text>
            ) : null}

            {/* head */}
            <circle cx={32} cy={17} r={10} fill={skin} />
            {hairFor(look.hair, hairColor)}

            {/* face */}
            <circle cx={28} cy={16.5} r={1.3} fill='#1F1F1F' />
            <circle cx={36} cy={16.5} r={1.3} fill='#1F1F1F' />
            {smiling ? (
                <path
                    d='M28 20.5 Q32 24 36 20.5'
                    stroke='#1F1F1F'
                    strokeWidth={1.6}
                    strokeLinecap='round'
                    fill='none'
                />
            ) : (
                <path
                    d='M29.5 21.5 L34.5 21.5'
                    stroke='#1F1F1F'
                    strokeWidth={1.6}
                    strokeLinecap='round'
                    fill='none'
                />
            )}
        </StyledSvg>
    );
};
