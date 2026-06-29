import { useEffect, useRef, useState } from 'react';
import {
    Box,
    Dialog,
    IconButton,
    InputBase,
    Paper,
    styled,
    Tooltip,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Close from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useKeyboardShortcut } from 'hooks/useKeyboardShortcut';
import { SEARCH_INPUT } from 'utils/testIds';
import { useOnClickOutside } from 'hooks/useOnClickOutside';
import {
    CommandResultGroup,
    type CommandResultGroupItem,
} from './RecentlyVisited/CommandResultGroup.tsx';
import { CommandPageSuggestions } from './CommandPageSuggestions.tsx';
import { useDebouncedCallback } from 'hooks/useDebouncedCallback';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import {
    type CommandQueryCounter,
    CommandSearchFeatures,
} from './CommandSearchFeatures.tsx';
import { useEventTracker } from 'hooks/useEventTracker';
import { CommandQuickSuggestions } from './CommandQuickSuggestions.tsx';
import { CommandSearchPages } from './CommandSearchPages.tsx';
import { CommandBarFeedback } from './CommandBarFeedback.tsx';
import { RecentlyVisitedRecorder } from './RecentlyVisitedRecorder.tsx';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { useCommandBarRoutes } from './useCommandBarRoutes.ts';

export const CommandResultsPaper = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    width: '100%',
    left: 0,
    // Anchor to the bottom edge of the input box rather than a fixed pixel
    // offset, so the dropdown stays flush even if the input height changes.
    // Pull up 1px to overlap the input's border row for a seamless seam.
    top: 'calc(100% - 1px)',
    zIndex: theme.zIndex.drawer,
    borderTop: theme.spacing(0),
    padding: theme.spacing(1.5, 0, 1.5),
    borderRadius: 0,
    borderBottomLeftRadius: theme.spacing(1),
    borderBottomRightRadius: theme.spacing(1),
    boxShadow: theme.shadows[2],
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    wordBreak: 'break-word',
    border: `1px solid ${theme.palette.neutral.border}`,
}));

const StyledContainer = styled('div', {
    shouldForwardProp: (prop) => prop !== 'active' && prop !== 'compact',
})<{
    active: boolean | undefined;
    compact?: boolean;
}>(({ theme, active, compact }) => ({
    border: `1px solid transparent`,
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: compact
        ? 'transparent'
        : theme.palette.background.application,
    maxWidth: active ? '100%' : '400px',
    [theme.breakpoints.down('md')]: {
        maxWidth: '100%',
    },
}));

const StyledCompactDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-container': { alignItems: 'flex-start' },
    '& .MuiDialog-paper': {
        overflow: 'visible',
        marginTop: theme.spacing(8),
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        background: 'transparent',
        boxShadow: 'none',
    },
}));

const StyledSearch = styled('div')<{ isOpen?: boolean }>(
    ({ theme, isOpen }) => ({
        display: 'flex',
        alignItems: 'center',
        // Fixed integer height (a touch taller than the largest 36px control)
        // so the box never lands on a sub-pixel — that kept the dropdown, which
        // anchors to this box's bottom, from sitting flush.
        height: 40,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.neutral.border}`,
        borderRadius: theme.shape.borderRadiusExtraLarge,
        padding: '3px 5px 3px 12px',
        width: '100%',
        zIndex: 3,
        ...(isOpen
            ? {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  // Keep the bottom border in the layout (transparent) so the
                  // box keeps its exact height when open — otherwise removing
                  // it shifts the vertically-centered box and text by ~1px.
                  borderBottomColor: 'transparent',
              }
            : {}),
    }),
);

const StyledInputBase = styled(InputBase, {
    shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact?: boolean }>(({ theme, compact }) => ({
    width: '100%',
    minWidth: compact ? 0 : '300px',
    backgroundColor: theme.palette.background.paper,
}));

const StyledClose = styled(Close)(({ theme }) => ({
    color: theme.palette.neutral.main,
    fontSize: theme.typography.body1.fontSize,
}));

const StyledIconButton = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
    color: open ? theme.palette.primary.main : theme.palette.neutral.main,
}));

export const CommandBar = () => {
    const { trackEvent } = useEventTracker();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLInputElement>(null);
    const compactIconRef = useRef<HTMLButtonElement>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchString, setSearchString] = useState<string | undefined>(
        undefined,
    );
    const [searchedProjects, setSearchedProjects] = useState<
        CommandResultGroupItem[]
    >([]);
    const [searchedPages, setSearchedPages] = useState<
        CommandResultGroupItem[]
    >([]);
    const [searchedFlagCount, setSearchedFlagCount] =
        useState<CommandQueryCounter>({ query: '', count: 0 });
    const [hasNoResults, setHasNoResults] = useState(false);
    const [value, setValue] = useState<string>('');
    const { allRoutes } = useCommandBarRoutes();
    const theme = useTheme();
    const isCompact = useMediaQuery(theme.breakpoints.down('md'));
    const [compactExpanded, setCompactExpanded] = useState(false);

    const hideSuggestions = () => {
        setShowSuggestions(false);
        if (isCompact) {
            setCompactExpanded(false);
            setValue('');
        }
    };

    const { projects } = useProjects();

    const debouncedSetSearchState = useDebouncedCallback((query: string) => {
        setSearchString(query);

        const filteredProjects = projects.filter((project) =>
            project.name.toLowerCase().includes(query.toLowerCase()),
        );

        const mappedProjects = filteredProjects.map((project) => ({
            name: project.name,
            link: `/projects/${project.id}`,
        }));

        setSearchedProjects(mappedProjects);

        const filteredPages = Object.values(allRoutes).filter((route) =>
            route.searchText.toLowerCase().includes(query.toLowerCase()),
        );
        const mappedPages = filteredPages.map((page) => ({
            name: page.title,
            link: page.path,
        }));
        setSearchedPages(mappedPages);

        const noResultsFound =
            query.length !== 0 &&
            mappedProjects.length === 0 &&
            mappedPages.length === 0 &&
            searchedFlagCount.count === 0 &&
            searchedFlagCount.query === query;
        if (noResultsFound) {
            trackEvent('command-bar', {
                props: {
                    eventType: 'no search results found',
                    query: query,
                },
            });
        }
        setHasNoResults(noResultsFound);
    }, 200);

    useEffect(() => {
        debouncedSetSearchState(value);
    }, [JSON.stringify(searchedFlagCount)]);

    const onSearchChange = (value: string) => {
        debouncedSetSearchState(value);
        setValue(value);
    };

    const clearSearchValue = () => {
        onSearchChange('');
        setShowSuggestions(false);
        if (isCompact) setCompactExpanded(false);
    };

    const hotkey = useKeyboardShortcut(
        {
            modifiers: ['ctrl'],
            key: 'k',
            preventDefault: true,
        },
        () => {
            if (isCompact) {
                if (compactExpanded) {
                    hideSuggestions();
                } else {
                    setCompactExpanded(true);
                }
            } else if (document.activeElement === searchInputRef.current) {
                searchInputRef.current?.blur();
            } else {
                searchInputRef.current?.focus();
            }
        },
    );
    useKeyboardShortcut({ key: 'Escape' }, () => {
        setShowSuggestions(false);
        if (searchContainerRef.current?.contains(document.activeElement)) {
            searchInputRef.current?.blur();
        }
        if (isCompact && compactExpanded) {
            setCompactExpanded(false);
            setValue('');
        }
    });
    const placeholder = `Command menu (${hotkey})`;

    const findCommandBarLinksAndSelectedIndex = () => {
        const allCommandBarLinks =
            searchContainerRef.current?.querySelectorAll('ul > a');
        if (!allCommandBarLinks || allCommandBarLinks.length === 0) return;

        let selectedIndex = -1;

        allCommandBarLinks.forEach((link, index) => {
            if (link === document.activeElement) {
                selectedIndex = index;
            }
        });

        return {
            allCommandBarLinks,
            selectedIndex,
        };
    };

    useKeyboardShortcut(
        {
            key: 'ArrowDown',
            preventDefault: true,
        },
        () => {
            const itemsAndIndex = findCommandBarLinksAndSelectedIndex();
            if (!itemsAndIndex) return;
            const { allCommandBarLinks, selectedIndex } = itemsAndIndex;

            const newIndex = selectedIndex + 1;
            if (newIndex >= allCommandBarLinks.length) {
                const element = searchInputRef.current;
                if (element) {
                    element.focus();
                    element.setSelectionRange(
                        element.value.length,
                        element.value.length,
                    );
                }
            } else {
                (allCommandBarLinks[newIndex] as HTMLElement).focus();
            }
        },
    );
    useKeyboardShortcut(
        {
            key: 'ArrowUp',
            preventDefault: true,
        },
        () => {
            const itemsAndIndex = findCommandBarLinksAndSelectedIndex();
            if (!itemsAndIndex) return;
            const { allCommandBarLinks, selectedIndex } = itemsAndIndex;

            const newIndex = selectedIndex - 1;

            if (newIndex >= 0) {
                (allCommandBarLinks[newIndex] as HTMLElement).focus();
            } else if (newIndex === -1) {
                const element = searchInputRef.current;
                if (element) {
                    element.focus();
                    element.setSelectionRange(
                        element.value.length,
                        element.value.length,
                    );
                }
            } else if (newIndex === -2) {
                (
                    allCommandBarLinks[
                        allCommandBarLinks.length - 1
                    ] as HTMLElement
                ).focus();
            }
        },
    );

    useKeyboardShortcut({ key: 'Tab' }, () => {
        setShowSuggestions(false);
    });

    useOnClickOutside([searchContainerRef, compactIconRef], hideSuggestions);
    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            setShowSuggestions(false);
        } else if (
            event.keyCode >= 48 &&
            event.keyCode <= 110 &&
            !hasNoResults
        ) {
            searchInputRef.current?.focus();
        }
    };

    const searchBar = (
        <StyledContainer
            ref={searchContainerRef}
            active={showSuggestions}
            compact={isCompact}
        >
            <RecentlyVisitedRecorder />
            <StyledSearch isOpen={showSuggestions}>
                <SearchIcon
                    sx={{
                        mr: 1,
                        color: (theme) => theme.palette.action.disabled,
                    }}
                />

                <ScreenReaderOnly>
                    <label htmlFor={'command-bar-input'}>{placeholder}</label>
                </ScreenReaderOnly>
                <StyledInputBase
                    id='command-bar-input'
                    inputRef={searchInputRef}
                    placeholder={placeholder}
                    autoFocus={isCompact}
                    compact={isCompact}
                    slotProps={{
                        input: {
                            'data-testid': SEARCH_INPUT,
                        } as React.InputHTMLAttributes<HTMLInputElement>,
                    }}
                    autoComplete='off'
                    value={value}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={() => {
                        setShowSuggestions(true);
                    }}
                />

                <Box sx={{ width: (theme) => theme.spacing(4) }}>
                    <ConditionallyRender
                        condition={Boolean(value)}
                        show={
                            <Tooltip title='Clear search query' arrow>
                                <IconButton
                                    size='small'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSearchChange('');
                                        searchInputRef.current?.focus();
                                    }}
                                    sx={{
                                        padding: (theme) => theme.spacing(1),
                                    }}
                                >
                                    <StyledClose />
                                </IconButton>
                            </Tooltip>
                        }
                    />
                </Box>
            </StyledSearch>

            <ConditionallyRender
                condition={Boolean(value) && showSuggestions}
                show={
                    <CommandResultsPaper onKeyDownCapture={onKeyDown}>
                        {searchString !== undefined && (
                            <CommandSearchFeatures
                                searchString={searchString}
                                setSearchedFlagCount={setSearchedFlagCount}
                                onClick={clearSearchValue}
                                setSearchLoading={setSearchLoading}
                            />
                        )}
                        <ConditionallyRender
                            condition={!searchLoading}
                            show={
                                <>
                                    <CommandResultGroup
                                        groupName={'Projects'}
                                        icon={'flag'}
                                        onClick={clearSearchValue}
                                        items={searchedProjects}
                                    />
                                    <CommandSearchPages
                                        items={searchedPages}
                                        onClick={clearSearchValue}
                                    />
                                    <ConditionallyRender
                                        condition={hasNoResults}
                                        show={
                                            <CommandBarFeedback
                                                onSubmit={hideSuggestions}
                                            />
                                        }
                                    />
                                </>
                            }
                        />
                    </CommandResultsPaper>
                }
                elseShow={
                    showSuggestions && (
                        <CommandResultsPaper onKeyDownCapture={onKeyDown}>
                            <CommandQuickSuggestions
                                routes={allRoutes}
                                onClick={clearSearchValue}
                            />
                            <CommandPageSuggestions
                                routes={allRoutes}
                                onClick={clearSearchValue}
                            />
                        </CommandResultsPaper>
                    )
                }
            />
        </StyledContainer>
    );

    if (isCompact) {
        return (
            <>
                <Tooltip title={placeholder} arrow>
                    <StyledIconButton
                        ref={compactIconRef}
                        size='large'
                        open={compactExpanded}
                        onClick={() => setCompactExpanded(true)}
                        aria-label={placeholder}
                    >
                        <SearchIcon />
                    </StyledIconButton>
                </Tooltip>
                <StyledCompactDialog
                    open={compactExpanded}
                    onClose={hideSuggestions}
                    fullWidth
                    maxWidth='sm'
                >
                    {searchBar}
                </StyledCompactDialog>
            </>
        );
    }

    return searchBar;
};
