import React, { useState } from 'react';
import classnames from 'classnames';
import { debounce } from 'debounce';
import { InputBase, Chip } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { useStyles } from 'component/common/SearchField/styles';
import ConditionallyRender from 'component/common/ConditionallyRender';

interface ISearchFieldProps {
    updateValue: React.Dispatch<React.SetStateAction<string>>;
    initialValue?: string;
    className?: string;
    showValueChip?: boolean;
}

export const SearchField = ({
    updateValue,
    initialValue = '',
    className = '',
    showValueChip,
}: ISearchFieldProps) => {
    const styles = useStyles();
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
        <div className={styles.container}>
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
        </div>
    );
};
