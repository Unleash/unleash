import { Typography, styled, useTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { Story, StoryMeta } from '../component/stories/types';

export const meta: StoryMeta = {
    title: 'Theme / Typography',
    background: 'application',
};

type Variant =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'body1'
    | 'body2'
    | 'caption'
    | 'button';

const VARIANTS: Variant[] = [
    'h1',
    'h2',
    'h3',
    'h4',
    'body1',
    'body2',
    'caption',
    'button',
];

const SAMPLE = 'The quick brown fox jumps over the lazy dog';

const remToPx = (value: unknown): number | null => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return null;
    const n = Number.parseFloat(value);
    if (Number.isNaN(n)) return null;
    if (value.endsWith('rem') || value.endsWith('em')) return n * 16;
    if (value.endsWith('px')) return n;
    return null;
};

const formatSize = (value: unknown): string => {
    const px = remToPx(value);
    if (typeof value === 'string' && px !== null) return `${value} (${px}px)`;
    if (typeof value === 'number') return `${value}px`;
    return String(value ?? '—');
};

const formatLineHeight = (
    lineHeight: unknown,
    fontSizePx: number | null,
): string => {
    if (lineHeight === undefined || lineHeight === null) return '—';
    if (typeof lineHeight === 'number' && fontSizePx !== null) {
        return `${lineHeight} (${Math.round(lineHeight * fontSizePx)}px)`;
    }
    return String(lineHeight);
};

const resolveVariant = (theme: Theme, variant: Variant) => {
    const style = theme.typography[variant] as {
        fontSize?: string | number;
        lineHeight?: string | number;
        fontWeight?: string | number;
    };
    const allVariants = (
        theme.typography as { allVariants?: { lineHeight?: string | number } }
    ).allVariants;
    const fontSize = style?.fontSize;
    const lineHeight = style?.lineHeight ?? allVariants?.lineHeight;
    const fontWeight = style?.fontWeight ?? theme.typography.fontWeightRegular;
    return { fontSize, lineHeight, fontWeight };
};

const Container = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3.5),
}));

const Row = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    alignItems: 'baseline',
    gap: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-of-type': {
        borderBottom: 'none',
        paddingBottom: 0,
    },
}));

const Meta = styled('div')(({ theme }) => ({
    fontFamily: 'monospace',
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
}));

const MetaTitle = styled('span')(({ theme }) => ({
    fontWeight: 700,
    color: theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing(0.5),
}));

const MetaLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.disabled,
}));

const MetaLine = styled('span')({
    display: 'flex',
    gap: 6,
});

export const BaseVariants: Story = () => {
    const theme = useTheme();
    return (
        <Container>
            {VARIANTS.map((variant) => {
                const { fontSize, lineHeight, fontWeight } = resolveVariant(
                    theme,
                    variant,
                );
                const fontSizePx = remToPx(fontSize);
                return (
                    <Row key={variant}>
                        <Meta>
                            <MetaTitle>{variant}</MetaTitle>
                            <MetaLine>
                                <MetaLabel>font-size:</MetaLabel>
                                <span>{formatSize(fontSize)}</span>
                            </MetaLine>
                            <MetaLine>
                                <MetaLabel>line-height:</MetaLabel>
                                <span>
                                    {formatLineHeight(lineHeight, fontSizePx)}
                                </span>
                            </MetaLine>
                            <MetaLine>
                                <MetaLabel>font-weight:</MetaLabel>
                                <span>{String(fontWeight)}</span>
                            </MetaLine>
                        </Meta>
                        <Typography variant={variant} component='div'>
                            {SAMPLE}
                        </Typography>
                    </Row>
                );
            })}
        </Container>
    );
};

const Sample = styled('div')<{ size: string }>(({ size, theme }) => {
    const allVariants = (
        theme.typography as { allVariants?: { lineHeight?: string | number } }
    ).allVariants;
    return {
        fontSize: size,
        lineHeight: allVariants?.lineHeight ?? 1.4,
        color: theme.palette.text.primary,
    };
});

export const FontSizeTokens: Story = () => {
    const theme = useTheme();
    const entries = Object.entries(theme.fontSizes ?? {}) as [string, string][];
    return (
        <Container>
            {entries.map(([key, value]) => (
                <Row key={key}>
                    <Meta>
                        <MetaTitle>fontSizes.{key}</MetaTitle>
                        <MetaLine>
                            <MetaLabel>size:</MetaLabel>
                            <span>{formatSize(value)}</span>
                        </MetaLine>
                    </Meta>
                    <Sample size={value}>{SAMPLE}</Sample>
                </Row>
            ))}
        </Container>
    );
};

export const FontWeights: Story = () => {
    const theme = useTheme();
    const entries = Object.entries(theme.fontWeight ?? {}) as [
        string,
        number,
    ][];
    return (
        <Container>
            {entries.map(([key, value]) => (
                <Row key={key}>
                    <Meta>
                        <MetaTitle>fontWeight.{key}</MetaTitle>
                        <MetaLine>
                            <MetaLabel>weight:</MetaLabel>
                            <span>{value}</span>
                        </MetaLine>
                    </Meta>
                    <Typography component='div' style={{ fontWeight: value }}>
                        {SAMPLE}
                    </Typography>
                </Row>
            ))}
        </Container>
    );
};
