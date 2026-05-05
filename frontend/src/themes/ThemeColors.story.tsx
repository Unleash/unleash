import { Box, Typography } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { lightTheme } from 'themes/theme';
import { darkTheme } from 'themes/dark-theme';
import type { Story, StoryMeta } from '../component/stories/types';

export const meta: StoryMeta = {
    title: 'Theme / Colors',
    background: 'application',
};

type ColorEntry = { path: string; value: string };
type ArrayEntry = { path: string; values: string[] };
type Entry = ColorEntry | ArrayEntry;

const SKIP_KEYS = new Set([
    'mode',
    'augmentColor',
    'getContrastText',
    'contrastThreshold',
    'tonalOffset',
]);

function flattenPalette(obj: unknown, prefix = ''): Entry[] {
    if (typeof obj !== 'object' || obj === null) return [];
    const result: Entry[] = [];
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
        if (SKIP_KEYS.has(key) || typeof val === 'function') continue;
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof val === 'string' && looksLikeColor(val)) {
            result.push({ path, value: val });
        } else if (
            Array.isArray(val) &&
            val.length > 0 &&
            val.every((v) => typeof v === 'string')
        ) {
            result.push({ path, values: val as string[] });
        } else if (
            typeof val === 'object' &&
            val !== null &&
            !Array.isArray(val)
        ) {
            result.push(...flattenPalette(val, path));
        }
    }
    return result;
}

function looksLikeColor(s: string): boolean {
    return s.startsWith('#') || s.startsWith('rgb') || s.startsWith('hsl');
}

function groupByTopKey(entries: Entry[]): [string, Entry[]][] {
    const map = new Map<string, Entry[]>();
    for (const entry of entries) {
        const group = entry.path.split('.')[0];
        if (!map.has(group)) map.set(group, []);
        map.get(group)!.push(entry);
    }
    return Array.from(map.entries());
}

const Swatch = ({ color, size = 36 }: { color: string; size?: number }) => (
    <Box
        title={color}
        sx={{
            width: size,
            height: size,
            background: color,
            borderRadius: '4px',
            border: '1px solid rgba(128,128,128,0.2)',
            flexShrink: 0,
        }}
    />
);

const ColorRow = ({ path, value }: ColorEntry) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
        <Swatch color={value} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
                component='div'
                sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    color: 'text.secondary',
                    wordBreak: 'break-all',
                    lineHeight: 1.4,
                }}
            >
                {path}
            </Typography>
            <Typography
                component='div'
                sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.65rem',
                    color: 'text.disabled',
                    lineHeight: 1.4,
                }}
            >
                {value}
            </Typography>
        </Box>
    </Box>
);

const ArrayRow = ({ path, values }: ArrayEntry) => (
    <Box sx={{ py: 0.75 }}>
        <Typography
            component='div'
            sx={{
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                color: 'text.secondary',
                mb: 0.5,
            }}
        >
            {path} ({values.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {values.map((v, i) => (
                <Swatch key={i} color={v} size={24} />
            ))}
        </Box>
    </Box>
);

const ThemeColumn = ({ theme, label }: { theme: Theme; label: string }) => {
    const entries = flattenPalette(theme.palette);
    const groups = groupByTopKey(entries);

    return (
        <MuiThemeProvider theme={theme}>
            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    p: 2,
                }}
            >
                <Typography
                    variant='subtitle1'
                    sx={{
                        fontWeight: 700,
                        mb: 2,
                        pb: 1,
                        borderBottom: '2px solid',
                        borderColor: 'divider',
                        color: 'text.primary',
                    }}
                >
                    {label}
                </Typography>
                {groups.map(([group, groupEntries]) => (
                    <Box key={group} sx={{ mb: 2.5 }}>
                        <Typography
                            component='div'
                            sx={{
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: 'text.disabled',
                                mb: 0.5,
                                pb: 0.25,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            {group}
                        </Typography>
                        {groupEntries.map((entry) =>
                            'value' in entry ? (
                                <ColorRow
                                    key={entry.path}
                                    path={entry.path}
                                    value={entry.value}
                                />
                            ) : (
                                <ArrayRow
                                    key={entry.path}
                                    path={entry.path}
                                    values={entry.values}
                                />
                            ),
                        )}
                    </Box>
                ))}
            </Box>
        </MuiThemeProvider>
    );
};

export const AllColors: Story = () => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <ThemeColumn theme={lightTheme} label='Light' />
        <ThemeColumn theme={darkTheme} label='Dark' />
    </Box>
);
