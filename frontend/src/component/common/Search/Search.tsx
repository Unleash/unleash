import React, { useRef, useState } from 'react';
import { IconButton, InputBase, Tooltip } from '@mui/material';
import { Search as SearchIcon, Close } from '@mui/icons-material';
import classnames from 'classnames';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './Search.styles';
import { SearchSuggestions } from './SearchSuggestions/SearchSuggestions';
import { IGetSearchContextOutput } from 'hooks/useSearch';
import { useKeyboardShortcut } from 'hooks/useKeyboardShortcut';
import { useAsyncDebounce } from 'react-table';

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
    const ref = useRef<HTMLInputElement>();
    const { classes: styles } = useStyles();
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [value, setValue] = useState(initialValue);
    const debouncedOnChange = useAsyncDebounce(onChange, debounceTime);

    const onSearchChange = (value: string) => {
        debouncedOnChange(value);
        setValue(value);
    };

    const hotkey = useKeyboardShortcut(
        { modifiers: ['ctrl'], key: 'k', preventDefault: true },
        () => {
            if (document.activeElement === ref.current) {
                ref.current?.blur();
            } else {
                ref.current?.focus();
            }
        }
    );
    useKeyboardShortcut({ key: 'Escape' }, () => {
        if (document.activeElement === ref.current) {
            ref.current?.blur();
        }
    });
    const placeholder = `${customPlaceholder ?? 'Search'} (${hotkey})`;

    return (
        <div className={styles.container} style={containerStyles}>
            <div
                className={classnames(
                    styles.search,
                    className,
                    'search-container'
                )}
            >
                <SearchIcon
                    className={classnames(styles.searchIcon, 'search-icon')}
                />
                <InputBase
                    inputRef={ref}
                    placeholder={placeholder}
                    classes={{
                        root: classnames(styles.inputRoot, 'input-container'),
                    }}
                    inputProps={{ 'aria-label': placeholder }}
                    value={value}
                    onChange={e => onSearchChange(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setShowSuggestions(false)}
                    disabled={disabled}
                />
                <div
                    className={classnames(
                        styles.clearContainer,
                        'clear-container'
                    )}
                >
                    <ConditionallyRender
                        condition={Boolean(value)}
                        show={
                            <Tooltip title="Clear search query" arrow>
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        onSearchChange('');
                                        ref.current?.focus();
                                    }}
                                >
                                    <Close className={styles.clearIcon} />
                                </IconButton>
                            </Tooltip>
                        }
                    />
                </div>
            </div>
            <ConditionallyRender
                condition={Boolean(hasFilters) && showSuggestions}
                show={
                    <SearchSuggestions getSearchContext={getSearchContext!} />
                }
            />
        </div>
    );
};
