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
import { CommandFeatures } from './CommandFeatures';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { CommandRecent } from './CommandRecent';
import { CommandPages } from './CommandPages';
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
    boxShadow: '0px 8px 20px rgba(33, 33, 33, 0.15)',
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    wordBreak: 'break-word',
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
    '&:focus-within': {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottom: '0px',
    },
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
    });
    const placeholder = `Command bar (${hotkey})`;

    useOnClickOutside([searchContainerRef], hideSuggestions);
    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            setShowSuggestions(false);
        } else if (event.keyCode >= 48 && event.keyCode <= 110) {
            searchInputRef.current?.focus();
        }
    };
    return (
        <StyledContainer ref={searchContainerRef} active={showSuggestions}>
            <RecentlyVisitedRecorder />
            <StyledSearch>
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
                    <CommandResultsPaper onKeyDownCapture={onKeyDown}>
                        {searchString !== undefined && (
                            <CommandFeatures
                                searchString={searchString}
                                setSearchedFlagCount={setSearchedFlagCount}
                            />
                        )}
                        <CommandResultGroup
                            groupName={'Projects'}
                            icon={'flag'}
                            items={searchedProjects}
                        />
                        <CommandPages items={searchedPages} />
                        <ConditionallyRender
                            condition={hasNoResults}
                            show={
                                <CommandBarFeedback
                                    onSubmit={hideSuggestions}
                                />
                            }
                        />
                    </CommandResultsPaper>
                }
                elseShow={
                    showSuggestions && (
                        <CommandResultsPaper onKeyDownCapture={onKeyDown}>
                            <CommandRecent routes={allRoutes} />
                            <CommandPageSuggestions routes={allRoutes} />
                        </CommandResultsPaper>
                    )
                }
            />
        </StyledContainer>
    );
};
