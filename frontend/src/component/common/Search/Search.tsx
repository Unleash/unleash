import React, { useRef, useState } from 'react';
import { useAsyncDebounce } from 'react-table';
import { Box, IconButton, InputBase, styled, Tooltip } from '@mui/material';
import { Search as SearchIcon, Close } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { SearchSuggestions } from './SearchSuggestions/SearchSuggestions';
import { IGetSearchContextOutput } from 'hooks/useSearch';
import { useKeyboardShortcut } from 'hooks/useKeyboardShortcut';
import { SEARCH_INPUT } from 'utils/testIds';
import { useOnClickOutside } from 'hooks/useOnClickOutside';

interface ISearchProps {
    initialValue?: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    hasFilters?: boolean;
    disabled?: boolean;
    getSearchContext?: () => IGetSearchContextOutput;
    containerStyles?: React.CSSProperties;
    debounceTime?: number;
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    maxWidth: '400px',
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
    onChange,
    className,
    placeholder: customPlaceholder,
    hasFilters,
    disabled,
    getSearchContext,
    containerStyles,
    debounceTime = 200,
}: ISearchProps) => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLInputElement>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const hideSuggestions = () => setShowSuggestions(false);

    const [value, setValue] = useState(initialValue);
    const debouncedOnChange = useAsyncDebounce(onChange, debounceTime);

    const onSearchChange = (value: string) => {
        debouncedOnChange(value);
        setValue(value);
    };

    const hotkey = useKeyboardShortcut(
        { modifiers: ['ctrl'], key: 'k', preventDefault: true },
        () => {
            if (document.activeElement === searchInputRef.current) {
                searchInputRef.current?.blur();
            } else {
                searchInputRef.current?.focus();
            }
        }
    );
    useKeyboardShortcut({ key: 'Escape' }, () => {
        if (document.activeElement === searchInputRef.current) {
            searchInputRef.current?.blur();
            hideSuggestions();
        }
    });
    const placeholder = `${customPlaceholder ?? 'Search'} (${hotkey})`;

    useOnClickOutside([searchInputRef, suggestionsRef], hideSuggestions);

    return (
        <StyledContainer style={containerStyles}>
            <StyledSearch className={className}>
                <SearchIcon
                    sx={{
                        mr: 1,
                        color: theme => theme.palette.action.disabled,
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
                    onChange={e => onSearchChange(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    disabled={disabled}
                />
                <Box sx={{ width: theme => theme.spacing(4) }}>
                    <ConditionallyRender
                        condition={Boolean(value)}
                        show={
                            <Tooltip title="Clear search query" arrow>
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        onSearchChange('');
                                        searchInputRef.current?.focus();
                                    }}
                                    sx={{ padding: theme => theme.spacing(1) }}
                                >
                                    <StyledClose />
                                </IconButton>
                            </Tooltip>
                        }
                    />
                </Box>
            </StyledSearch>
            <ConditionallyRender
                condition={Boolean(hasFilters) && showSuggestions}
                show={
                    <div ref={suggestionsRef}>
                        <SearchSuggestions
                            getSearchContext={getSearchContext!}
                        />
                    </div>
                }
            />
        </StyledContainer>
    );
};
