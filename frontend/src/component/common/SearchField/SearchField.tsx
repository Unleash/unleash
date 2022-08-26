import React, { useState, VFC } from 'react';
import classnames from 'classnames';
import { debounce } from 'debounce';
import { InputBase, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useStyles } from 'component/common/SearchField/styles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface ISearchFieldProps {
    updateValue: (value: string) => void;
    initialValue?: string;
    className?: string;
    showValueChip?: boolean;
}

/**
 * @deprecated use `Search` instead.
 */
export const SearchField: VFC<ISearchFieldProps> = ({
    updateValue,
    initialValue = '',
    className = '',
    showValueChip,
}) => {
    const { classes: styles } = useStyles();
    const [localValue, setLocalValue] = useState(initialValue);
    const debounceUpdateValue = debounce(updateValue, 500);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const value = event.target.value || '';
        setLocalValue(value);
        debounceUpdateValue(value);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            updateValue(localValue);
        }
    };

    const updateNow = () => {
        updateValue(localValue);
    };

    const onDelete = () => {
        setLocalValue('');
        updateValue('');
    };

    return (
        <form className={styles.container} role="search">
            <div className={classnames(styles.search, className)}>
                <SearchIcon className={styles.searchIcon} />
                <InputBase
                    placeholder="Search..."
                    classes={{ root: styles.inputRoot }}
                    inputProps={{ 'aria-label': 'search' }}
                    value={localValue}
                    onChange={handleChange}
                    onBlur={updateNow}
                    onKeyPress={handleKeyPress}
                    type="search"
                />
            </div>
            <ConditionallyRender
                condition={Boolean(showValueChip && localValue)}
                show={
                    <Chip
                        label={localValue}
                        onDelete={onDelete}
                        title="Clear search query"
                    />
                }
            />
        </form>
    );
};
