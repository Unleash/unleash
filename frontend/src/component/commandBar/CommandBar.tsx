import { useRef, useState } from 'react';
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
import { useOnBlur } from 'hooks/useOnBlur';
import { RecentlyVisited } from './RecentlyVisited/RecentlyVisited';
import { useRecentlyVisited } from 'hooks/useRecentlyVisited';
import { useGlobalFeatureSearch } from '../feature/FeatureToggleList/useGlobalFeatureSearch';
import {
    CommandResultGroup,
    type CommandResultGroupItem,
} from './RecentlyVisited/CommandResultGroup';

export const CommandResultsPaper = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    width: '100%',
    left: 0,
    top: '20px',
    zIndex: 2,
    padding: theme.spacing(4, 1.5, 1.5),
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
        borderColor: theme.palette.primary.main,
        boxShadow: theme.boxShadows.main,
    },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledClose = styled(Close)(({ theme }) => ({
    color: theme.palette.neutral.main,
    fontSize: theme.typography.body1.fontSize,
}));

export const CommandBar = () => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLInputElement>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { lastVisited } = useRecentlyVisited();
    const hideSuggestions = () => {
        setShowSuggestions(false);
    };

    const [value, setValue] = useState<string>('');

    const onSearchChange = (value: string) => {
        setTableState({ query: value });
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
        if (searchContainerRef.current?.contains(document.activeElement)) {
            searchInputRef.current?.blur();
        }
    });
    const placeholder = `Search (${hotkey})`;

    useOnClickOutside([searchContainerRef], hideSuggestions);
    useOnBlur(searchContainerRef, hideSuggestions);

    const { features, setTableState } = useGlobalFeatureSearch(3);

    const flags: CommandResultGroupItem[] = features.map((feature) => ({
        name: feature.name,
        link: `/projects/${feature.project}/features/${feature.name}`,
    }));

    return (
        <StyledContainer ref={searchContainerRef} active={showSuggestions}>
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
                                        e.stopPropagation(); // prevent outside click from the lazily added element
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
                condition={Boolean(value)}
                show={
                    <CommandResultsPaper className='dropdown-outline'>
                        <CommandResultGroup
                            groupName={'Flags'}
                            icon={'flag'}
                            items={flags}
                        />
                    </CommandResultsPaper>
                }
                elseShow={
                    showSuggestions && (
                        <CommandResultsPaper className='dropdown-outline'>
                            <RecentlyVisited lastVisited={lastVisited} />
                        </CommandResultsPaper>
                    )
                }
            />
        </StyledContainer>
    );
};
