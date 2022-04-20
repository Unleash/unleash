import { IconButton, InputBase, Tooltip } from '@material-ui/core';
import { Search, Close } from '@material-ui/icons';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { useStyles } from 'component/common/Table/TableActions/TableSearchField/TableSearchField.styles';
import classnames from 'classnames';

interface ITableSearchFieldProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    onBlur?: (clear?: boolean) => void;
}

export const TableSearchField = ({
    value,
    onChange,
    className,
    placeholder,
    onBlur,
}: ITableSearchFieldProps) => {
    const styles = useStyles();
    const placeholderText = placeholder ?? 'Search...';

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
                    autoFocus
                    placeholder={placeholderText}
                    classes={{
                        root: classnames(styles.inputRoot, 'input-container'),
                    }}
                    inputProps={{ 'aria-label': placeholderText }}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onBlur={() => onBlur?.()}
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
                                    aria-label="Clear search query"
                                    onClick={() => {
                                        onChange('');
                                        onBlur?.(true);
                                    }}
                                >
                                    <Close className={styles.clearIcon} />
                                </IconButton>
                            </Tooltip>
                        }
                    />
                </div>
            </div>
        </div>
    );
};
