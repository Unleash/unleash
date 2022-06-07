import { useRef, useState } from 'react';
import { IconButton, InputBase, Tooltip } from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import classnames from 'classnames';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './TableSearchField.styles';
import { TableSearchFieldSuggestions } from './TableSearchFieldSuggestions/TableSearchFieldSuggestions';
import { IGetSearchContextOutput } from 'hooks/useSearch';
import { useKeyboardShortcut } from 'hooks/useKeyboardShortcut';

interface ITableSearchFieldProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    hasFilters?: boolean;
    getSearchContext?: () => IGetSearchContextOutput;
}

export const TableSearchField = ({
    value = '',
    onChange,
    className,
    placeholder: customPlaceholder,
    hasFilters,
    getSearchContext,
}: ITableSearchFieldProps) => {
    const ref = useRef<HTMLInputElement>();
    const { classes: styles } = useStyles();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const hotkey = useKeyboardShortcut(
        { modifiers: ['ctrl'], key: 'k', preventDefault: true },
        () => {
            ref.current?.focus();
            setShowSuggestions(true);
        }
    );
    useKeyboardShortcut({ key: 'Escape' }, () => {
        if (document.activeElement === ref.current) {
            setShowSuggestions(suggestions => !suggestions);
        }
    });
    const placeholder = `${customPlaceholder ?? 'Search'} (${hotkey})`;

    return (
        <div className={styles.container}>
            <div
                className={classnames(
                    styles.search,
                    className,
                    'search-container'
                )}
            >
                <Search
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
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setShowSuggestions(false)}
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
                                        onChange('');
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
                    <TableSearchFieldSuggestions
                        getSearchContext={getSearchContext!}
                    />
                }
            />
        </div>
    );
};
