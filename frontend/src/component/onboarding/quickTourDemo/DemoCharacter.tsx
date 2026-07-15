import { styled, useTheme } from '@mui/material';
import type { DemoLook } from './demoModel.js';

const SKIN_TONES = ['#F6C9A0', '#EAB08C', '#C98D64', '#9C6B43', '#6E4A2E'];

// Hair is a physical trait, not a decorative accent, so it stays hardcoded
// with realistic shades (black through blond, plus grey) rather than mapped
// to a theme palette.
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

/**
 * Cap on the per-character transition delay so the tail of the crowd doesn't
 * lag noticeably behind a slider drag.
 */
const MAX_STAGGER_MS = 400;
const STAGGER_STEP_MS = 18;

// Two stacked zero-offset blur drop-shadows compound into a soft ~1px halo
// around the character. Applied to the HTML wrapper (not the <svg> itself)
// because CSS filter on <svg> has inconsistent browser support, and the
// wrapper treats the whole rendered SVG output as one silhouette, so there's
// no seam at the arm/body join.
const StyledCharacterWrapper = styled('div')(({ theme }) => ({
    width: '100%',
    lineHeight: 0,
    filter: `drop-shadow(0 0 0.5px ${theme.palette.grey[700]}) drop-shadow(0 0 0.5px ${theme.palette.grey[700]})`,
}));

const StyledSvg = styled('svg', {
    shouldForwardProp: (prop) => prop !== 'delayMs',
})<{ delayMs: number }>(({ theme, delayMs }) => ({
    display: 'block',
    width: '100%',
    height: 'auto',
    overflow: 'visible',
    '& .demo-character-arm': {
        transition: theme.transitions.create(['transform'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeOut,
        }),
        transitionDelay: `${delayMs}ms`,
    },
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
    /** Enabled users raise a hand. */
    raised: boolean;
    /** Overrides the user's own shirt colour (used for variant colouring). */
    shirtColor?: string;
    /** Short letter drawn on the shirt (the user's variant). */
    badge?: string;
    /** Grid position; staggers transitions into a wave across the crowd. */
    index?: number;
}

/**
 * A small illustrated person for the quick-tour crowd. Enabled users raise a
 * hand; match state is signalled by the surrounding container's background.
 */
export const DemoCharacter = ({
    look,
    raised,
    shirtColor,
    badge,
    index = 0,
}: IDemoCharacterProps) => {
    const theme = useTheme();
    const shirtVariants = theme.palette.variants;
    const skin = SKIN_TONES[look.skin % SKIN_TONES.length];
    const hairColor = HAIR_COLORS[look.hairColor % HAIR_COLORS.length];
    const shirt =
        shirtColor ?? shirtVariants[look.shirt % shirtVariants.length];
    const delayMs = Math.min(index * STAGGER_STEP_MS, MAX_STAGGER_MS);

    return (
        <StyledCharacterWrapper>
            <StyledSvg
                viewBox='0 0 64 64'
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
                <path
                    d='M29.5 21 Q32 22.5 34.5 21'
                    stroke='#1F1F1F'
                    strokeWidth={1.4}
                    strokeLinecap='round'
                    fill='none'
                />
            </StyledSvg>
        </StyledCharacterWrapper>
    );
};
