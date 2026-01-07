import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useAsyncDebounce } from 'react-table';
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
import { SearchSuggestions } from './SearchSuggestions/SearchSuggestions.tsx';
import type { IGetSearchContextOutput } from 'hooks/useSearch';
import { useKeyboardShortcut } from 'hooks/useKeyboardShortcut';
import { SEARCH_INPUT } from 'utils/testIds';
import { useOnClickOutside } from 'hooks/useOnClickOutside';
import { useSavedQuery } from './useSavedQuery.ts';
import { useOnBlur } from 'hooks/useOnBlur';
import { SearchHistory } from './SearchSuggestions/SearchHistory.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

interface ISearchProps {
    id?: string;
    initialValue?: string;
    onChange: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    className?: string;
    placeholder?: string;
    hasFilters?: boolean;
    disabled?: boolean;
    getSearchContext?: () => IGetSearchContextOutput;
    containerStyles?: React.CSSProperties;
    debounceTime?: number;
    expandable?: boolean;
}

export const SearchPaper = styled(Paper)(({ theme }) => ({
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

export const Search = ({
    initialValue = '',
    id,
    onChange,
    onFocus,
    onBlur,
    className,
    placeholder: customPlaceholder,
    hasFilters,
    disabled,
    getSearchContext,
    containerStyles,
    expandable = false,
    debounceTime = 200,
    ...rest
}: ISearchProps) => {
    const { trackEvent } = usePlausibleTracker();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLInputElement>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [usedHotkey, setUsedHotkey] = useState(false);
    const hideSuggestions = () => {
        setShowSuggestions(false);
        onBlur?.();
    };

    const { savedQuery, setSavedQuery } = useSavedQuery(id);

    const [value, setValue] = useState<string>(initialValue);
    const debouncedOnChange = useAsyncDebounce(onChange, debounceTime);

    const onSearchChange = (value: string) => {
        debouncedOnChange(value);
        setValue(value);
        setSavedQuery(value);
    };

    const hotkey = useKeyboardShortcut(
        {
            modifiers: ['ctrl', 'shift'],
            key: 'K',
            preventDefault: true,
        },
        () => {
            setUsedHotkey(true);
            if (document.activeElement === searchInputRef.current) {
                searchInputRef.current?.blur();
            } else {
                searchInputRef.current?.focus();
            }
        },
    );

    useEffect(() => {
        if (!showSuggestions) {
            return;
        }
        if (usedHotkey) {
            trackEvent('search-opened', {
                props: {
                    eventType: 'hotkey',
                },
            });
        } else {
            trackEvent('search-opened', {
                props: {
                    eventType: 'manual',
                },
            });
        }
        setUsedHotkey(false);
    }, [showSuggestions]);

    useKeyboardShortcut({ key: 'Escape' }, () => {
        if (searchContainerRef.current?.contains(document.activeElement)) {
            searchInputRef.current?.blur();
        }
    });
    const placeholder = `${customPlaceholder ?? 'Search'} (${hotkey})`;

    useOnClickOutside([searchContainerRef], hideSuggestions);
    useOnBlur(searchContainerRef, hideSuggestions);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const historyEnabled = showSuggestions && id;

    return (
        <StyledContainer
            ref={searchContainerRef}
            style={containerStyles}
            active={expandable && showSuggestions}
            {...rest}
        >
            <StyledSearch className={className}>
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
                        onFocus?.();
                    }}
                    disabled={disabled}
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
                condition={
                    Boolean(hasFilters && getSearchContext) && showSuggestions
                }
                show={
                    <SearchSuggestions
                        onSuggestion={(suggestion) => {
                            onSearchChange(suggestion);
                            searchInputRef.current?.focus();
                        }}
                        savedQuery={savedQuery}
                        getSearchContext={getSearchContext!}
                    />
                }
                elseShow={
                    historyEnabled && (
                        <SearchPaper className='dropdown-outline'>
                            <SearchHistory
                                onSuggestion={onSearchChange}
                                savedQuery={savedQuery}
                            />
                        </SearchPaper>
                    )
                }
            />
        </StyledContainer>
    );
};
