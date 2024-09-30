import { useEffect, useRef, useState } from 'react';
import {
    Box,
    IconButton,
    InputBase,
    Paper,
    styled,
    Tooltip,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useKeyboardShortcut } from 'hooks/useKeyboardShortcut';
import { SEARCH_INPUT } from 'utils/testIds';
import { useOnClickOutside } from 'hooks/useOnClickOutside';
import {
    CommandResultGroup,
    type CommandResultGroupItem,
} from './RecentlyVisited/CommandResultGroup';
import { CommandPageSuggestions } from './CommandPageSuggestions';
import { useRoutes } from 'component/layout/MainLayout/NavigationSidebar/useRoutes';
import { useAsyncDebounce } from 'react-table';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { CommandSearchFeatures } from './CommandSearchFeatures';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { CommandQuickSuggestions } from './CommandQuickSuggestions';
import { CommandSearchPages } from './CommandSearchPages';
import { CommandBarFeedback } from './CommandBarFeedback';
import { RecentlyVisitedRecorder } from './RecentlyVisitedRecorder';

export const CommandResultsPaper = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    width: '100%',
    left: 0,
    top: '39px',
    zIndex: 4,
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
    shouldForwardProp: (prop) => prop !== 'active',
})<{
    active: boolean | undefined;
}>(({ theme, active }) => ({
    border: `1px solid transparent`,
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    maxWidth: active ? '100%' : '400px',
    [theme.breakpoints.down('md')]: {
        marginTop: theme.spacing(1),
        maxWidth: '100%',
    },
}));

const StyledSearch = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.background.elevation1,
    border: `1px solid ${theme.palette.neutral.border}`,
    borderRadius: theme.shape.borderRadiusExtraLarge,
    padding: '3px 5px 3px 12px',
    width: '100%',
    zIndex: 3,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    width: '100%',
    minWidth: '300px',
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledClose = styled(Close)(({ theme }) => ({
    color: theme.palette.neutral.main,
    fontSize: theme.typography.body1.fontSize,
}));

interface IPageRouteInfo {
    path: string;
    route: string;
    title: string;
}

export const CommandBar = () => {
    const { trackEvent } = usePlausibleTracker();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLInputElement>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchString, setSearchString] = useState(undefined);
    const [searchedProjects, setSearchedProjects] = useState<
        CommandResultGroupItem[]
    >([]);
    const [searchedPages, setSearchedPages] = useState<
        CommandResultGroupItem[]
    >([]);
    const [searchedFlagCount, setSearchedFlagCount] = useState(0);
    const [hasNoResults, setHasNoResults] = useState(false);
    const [value, setValue] = useState<string>('');
    const { routes } = useRoutes();
    const allRoutes: Record<string, IPageRouteInfo> = {};
    for (const route of [
        ...routes.mainNavRoutes,
        ...routes.adminRoutes,
        ...routes.mobileRoutes,
    ]) {
        allRoutes[route.path] = {
            path: route.path,
            route: route.route,
            title: route.title,
        };
    }

    const hideSuggestions = () => {
        setShowSuggestions(false);
    };

    const { projects } = useProjects();

    const debouncedSetSearchState = useAsyncDebounce((query) => {
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
            route.title.toLowerCase().includes(query.toLowerCase()),
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
            searchedFlagCount === 0;
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
    }, [searchedFlagCount]);

    const onSearchChange = (value: string) => {
        debouncedSetSearchState(value);
        setValue(value);
    };

    const clearSearchValue = () => {
        onSearchChange('');
        setShowSuggestions(false);
    };

    const hotkey = useKeyboardShortcut(
        {
            modifiers: ['ctrl'],
            key: 'k',
            preventDefault: true,
        },
        () => {
            if (document.activeElement === searchInputRef.current) {
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
            if (newIndex >= allCommandBarLinks.length) return;

            (allCommandBarLinks[newIndex] as HTMLElement).focus();
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
            } else {
                const element = searchInputRef.current;
                if (element) {
                    element.focus();
                    element.setSelectionRange(
                        element.value.length,
                        element.value.length,
                    );
                }
            }
        },
    );

    useOnClickOutside([searchContainerRef], hideSuggestions);
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

    const onBlur = (evt: React.FocusEvent) => {
        if (
            evt.relatedTarget === null ||
            !searchContainerRef.current?.contains(evt.relatedTarget)
        ) {
            hideSuggestions();
        }
    };

    return (
        <StyledContainer ref={searchContainerRef} active={showSuggestions}>
            <RecentlyVisitedRecorder />
            <StyledSearch
                sx={{
                    borderBottomLeftRadius: (theme) =>
                        showSuggestions
                            ? 0
                            : theme.shape.borderRadiusExtraLarge,
                    borderBottomRightRadius: (theme) =>
                        showSuggestions
                            ? 0
                            : theme.shape.borderRadiusExtraLarge,
                    borderBottom: (theme) =>
                        showSuggestions
                            ? '0px'
                            : `1px solid ${theme.palette.neutral.border}`,
                }}
            >
                <SearchIcon
                    sx={{
                        mr: 1,
                        color: (theme) => theme.palette.action.disabled,
                    }}
                />
                <StyledInputBase
                    inputRef={searchInputRef}
                    placeholder={placeholder}
                    inputProps={{
                        'aria-label': placeholder,
                        'data-testid': SEARCH_INPUT,
                    }}
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
                    <CommandResultsPaper
                        onKeyDownCapture={onKeyDown}
                        onBlur={onBlur}
                    >
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
                        <CommandResultsPaper
                            onKeyDownCapture={onKeyDown}
                            onBlur={onBlur}
                        >
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
};
