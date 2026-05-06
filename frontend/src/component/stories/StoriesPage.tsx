import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LinkOutlined from '@mui/icons-material/LinkOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { useThemeMode } from 'hooks/useThemeMode';
import { useSearchParams } from 'react-router-dom';
import type { BgKey, Story, StoryMeta } from './types.ts';

interface StoryModule {
    meta?: StoryMeta;
    [key: string]: Story | StoryMeta | undefined;
}

const storyModules = import.meta.glob<StoryModule>('../../**/*.story.tsx', {
    eager: true,
});

interface StoryEntry {
    moduleKey: string;
    meta: StoryMeta;
    category: string;
    name: string;
    stories: { name: string; component: Story }[];
}

function buildEntries(): StoryEntry[] {
    const entries: StoryEntry[] = [];
    for (const [key, mod] of Object.entries(storyModules)) {
        if (!mod.meta) continue;
        const stories = Object.entries(mod)
            .filter(([k, v]) => k !== 'meta' && typeof v === 'function')
            .map(([k, v]) => ({ name: k, component: v as Story }));
        if (stories.length === 0) continue;
        const parts = mod.meta.title.split('/').map((s) => s.trim());
        const name = parts.pop() ?? mod.meta.title;
        const category = parts.length > 0 ? parts.join(' / ') : 'General';
        entries.push({
            moduleKey: key,
            meta: mod.meta,
            category,
            name,
            stories,
        });
    }
    return entries.sort(
        (a, b) =>
            a.category.localeCompare(b.category) ||
            a.name.localeCompare(b.name),
    );
}

const allEntries = buildEntries();

const toSlug = (s: string) =>
    s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

const toAnchorId = (storyName: string) =>
    storyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const entrySlug = (entry: StoryEntry) =>
    `${toSlug(entry.category)}/${toSlug(entry.name)}`;

const BG_OPTIONS = [
    { key: 'paper', label: 'Paper' },
    { key: 'elevation1', label: 'Elevation 1' },
    { key: 'elevation2', label: 'Elevation 2' },
    { key: 'application', label: 'Application' },
    { key: 'sidebar', label: 'Sidebar' },
] as const;

const Root = styled('div')({
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
});

const Sidebar = styled('nav')(({ theme }) => ({
    width: 220,
    flexShrink: 0,
    borderRight: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: theme.palette.background.paper,
}));

const SidebarTop = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
}));

const SidebarScroll = styled('div')({
    flex: 1,
    overflowY: 'auto',
    padding: '8px 4px',
});

const CategoryLabel = styled('div')(({ theme }) => ({
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: theme.palette.text.disabled,
    padding: theme.spacing(1.5, 1.5, 0.5),
}));

const NavItem = styled('button', {
    shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected: boolean }>(({ theme, isSelected }) => ({
    display: 'block',
    width: '100%',
    textAlign: 'left',
    border: 'none',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.75, 1.5),
    cursor: 'pointer',
    fontSize: 13,
    background: isSelected ? theme.palette.action.selected : 'transparent',
    color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
    fontWeight: isSelected ? 500 : 400,
    '&:hover': {
        background: isSelected
            ? theme.palette.action.selected
            : theme.palette.action.hover,
    },
}));

const VariantLink = styled('a', {
    shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive: boolean }>(({ theme, isActive }) => ({
    display: 'block',
    padding: theme.spacing(0.5, 1.5, 0.5, 3.5),
    fontSize: 12,
    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
    fontWeight: isActive ? 500 : 400,
    textDecoration: 'none',
    borderRadius: theme.shape.borderRadius,
    background: isActive ? theme.palette.action.selected : 'transparent',
    '&:hover': {
        color: isActive
            ? theme.palette.primary.main
            : theme.palette.text.primary,
        background: theme.palette.action.hover,
    },
}));

const Main = styled('main')({
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
});

const MainHeader = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexShrink: 0,
}));

const Canvas = styled('div')(({ theme }) => ({
    flex: 1,
    overflow: 'auto',
    padding: theme.spacing(4),
}));

const StorySection = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(6),
}));

const StorySectionLabel = styled('div', {
    shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive: boolean }>(({ theme, isActive }) => ({
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'monospace',
    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
    marginBottom: theme.spacing(1.5),
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    '& .anchor-icon': {
        fontSize: 14,
        opacity: isActive ? 1 : 0,
        transition: 'opacity 0.15s',
    },
    '&:hover .anchor-icon': {
        opacity: 1,
    },
}));

const CanvasInner = styled('div')(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    width: '100%',
    boxSizing: 'border-box',
}));

const BgSwatch = styled('button', {
    shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected: boolean }>(({ theme, isSelected }) => ({
    width: 20,
    height: 20,
    borderRadius: theme.shape.borderRadius,
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    outline: isSelected
        ? `3px solid ${theme.palette.primary.main}`
        : `1px solid ${theme.palette.primary.main}`,
    outlineOffset: isSelected ? 1 : 0,
    flexShrink: 0,
}));

const StoriesPage = () => {
    const { themeMode, onSetThemeMode } = useThemeMode();
    const theme = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const [bgKey, setBgKey] = useState<BgKey>(
        allEntries[0]?.meta.background ?? 'application',
    );
    const canvasRef = useRef<HTMLDivElement>(null);

    const cParam = searchParams.get('c');
    const sParam = searchParams.get('s');

    const activeEntry =
        (cParam ? allEntries.find((e) => entrySlug(e) === cParam) : null) ??
        allEntries[0];
    const activeAnchor = sParam;

    const grouped = allEntries.reduce<Record<string, StoryEntry[]>>(
        (acc, e) => {
            if (!acc[e.category]) acc[e.category] = [];
            acc[e.category].push(e);
            return acc;
        },
        {},
    );

    useEffect(() => {
        setBgKey(activeEntry?.meta.background ?? 'application');
    }, [activeEntry]);

    useEffect(() => {
        if (!sParam) {
            canvasRef.current?.scrollTo({ top: 0 });
            return;
        }
        requestAnimationFrame(() => {
            const el = document.getElementById(sParam);
            if (el && canvasRef.current) {
                const containerTop =
                    canvasRef.current.getBoundingClientRect().top;
                const elTop = el.getBoundingClientRect().top;
                canvasRef.current.scrollTo({
                    top:
                        canvasRef.current.scrollTop + elTop - containerTop - 32,
                    behavior: 'smooth',
                });
            }
        });
    }, [sParam]);

    const handleSelectEntry = (entry: StoryEntry) => {
        setSearchParams({ c: entrySlug(entry) });
    };

    const handleVariantClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        entry: StoryEntry,
        storyName: string,
    ) => {
        e.preventDefault();
        setSearchParams({ c: entrySlug(entry), s: toAnchorId(storyName) });
    };

    const handleAnchorClick = (storyName: string) => {
        const anchor = toAnchorId(storyName);
        const params = new URLSearchParams({
            c: entrySlug(activeEntry!),
            s: anchor,
        });
        setSearchParams(params);
        navigator.clipboard
            .writeText(
                `${window.location.origin}${window.location.pathname}?${params}`,
            )
            .catch((e) => {
                console.error('Failed to copy link to clipboard', e);
            });
    };

    const canvasBg =
        theme.palette.background[
            bgKey as keyof typeof theme.palette.background
        ];

    return (
        <Root>
            <Sidebar>
                <SidebarTop>
                    <Typography
                        variant='body2'
                        sx={{ fontWeight: 700, fontFamily: 'monospace' }}
                    >
                        _stories
                    </Typography>
                    <Tooltip
                        title={`${themeMode === 'light' ? 'Dark' : 'Light'} mode`}
                    >
                        <IconButton size='small' onClick={onSetThemeMode}>
                            {themeMode === 'light' ? (
                                <DarkModeOutlined sx={{ fontSize: 16 }} />
                            ) : (
                                <LightModeOutlined sx={{ fontSize: 16 }} />
                            )}
                        </IconButton>
                    </Tooltip>
                </SidebarTop>
                <SidebarScroll>
                    {Object.entries(grouped).map(([category, items]) => (
                        <div key={category}>
                            <CategoryLabel>{category}</CategoryLabel>
                            {items.map((entry) => (
                                <div key={entry.moduleKey}>
                                    <NavItem
                                        isSelected={
                                            entry.moduleKey ===
                                            activeEntry?.moduleKey
                                        }
                                        onClick={() => handleSelectEntry(entry)}
                                    >
                                        {entry.name}
                                    </NavItem>
                                    {entry.moduleKey ===
                                        activeEntry?.moduleKey &&
                                        entry.stories.map((s) => (
                                            <VariantLink
                                                key={s.name}
                                                href={`?c=${entrySlug(entry)}&s=${toAnchorId(s.name)}`}
                                                isActive={
                                                    activeAnchor ===
                                                    toAnchorId(s.name)
                                                }
                                                onClick={(e) =>
                                                    handleVariantClick(
                                                        e,
                                                        entry,
                                                        s.name,
                                                    )
                                                }
                                            >
                                                {s.name}
                                            </VariantLink>
                                        ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </SidebarScroll>
            </Sidebar>

            <Main>
                {activeEntry ? (
                    <>
                        <MainHeader>
                            <Typography
                                variant='body2'
                                sx={{ color: 'text.disabled', fontSize: 12 }}
                            >
                                {activeEntry.category}
                            </Typography>
                            <Typography
                                variant='body2'
                                sx={{ color: 'text.disabled', fontSize: 12 }}
                            >
                                /
                            </Typography>
                            <Typography
                                variant='body2'
                                sx={{ fontWeight: 600, fontSize: 14 }}
                            >
                                {activeEntry.name}
                            </Typography>
                            <Box
                                sx={{
                                    ml: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Typography
                                    variant='caption'
                                    sx={{ color: 'text.disabled', mr: 0.25 }}
                                >
                                    Background:
                                </Typography>
                                {BG_OPTIONS.map(({ key, label }) => (
                                    <Tooltip key={key} title={label} arrow>
                                        <BgSwatch
                                            isSelected={bgKey === key}
                                            onClick={() => setBgKey(key)}
                                            style={{
                                                background:
                                                    theme.palette.background[
                                                        key as keyof typeof theme.palette.background
                                                    ],
                                            }}
                                        />
                                    </Tooltip>
                                ))}
                            </Box>
                        </MainHeader>
                        <Canvas ref={canvasRef} sx={{ background: canvasBg }}>
                            {activeEntry.stories.map((s) => {
                                const StoryComponent = s.component;
                                return (
                                    <StorySection key={s.name}>
                                        <StorySectionLabel
                                            id={toAnchorId(s.name)}
                                            isActive={
                                                activeAnchor ===
                                                toAnchorId(s.name)
                                            }
                                            onClick={() =>
                                                handleAnchorClick(s.name)
                                            }
                                        >
                                            {s.name}
                                            <LinkOutlined className='anchor-icon' />
                                        </StorySectionLabel>
                                        <CanvasInner>
                                            <StoryComponent />
                                        </CanvasInner>
                                    </StorySection>
                                );
                            })}
                        </Canvas>
                    </>
                ) : (
                    <Box sx={{ p: 4 }}>
                        <Typography color='text.secondary'>
                            No stories found. Create a{' '}
                            <Box
                                component='code'
                                sx={{ fontFamily: 'monospace' }}
                            >
                                *.story.tsx
                            </Box>{' '}
                            file anywhere under{' '}
                            <Box
                                component='code'
                                sx={{ fontFamily: 'monospace' }}
                            >
                                frontend/src/
                            </Box>{' '}
                            to get started.
                        </Typography>
                    </Box>
                )}
            </Main>
        </Root>
    );
};

export default StoriesPage;
