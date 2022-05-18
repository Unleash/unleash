import { FC, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useAsyncDebounce } from 'react-table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AnimateOnMount from 'component/common/AnimateOnMount/AnimateOnMount';
import { TableSearchField } from './TableSearchField/TableSearchField';
import { useStyles } from './TableActions.styles';

interface ITableActionsProps {
    initialSearchValue?: string;
    onSearch?: (value: string) => void;
    searchTip?: string;
    isSeparated?: boolean;
}

/**
 * @deprecated Use <PageHeader actions={} /> instead
 */
export const TableActions: FC<ITableActionsProps> = ({
    initialSearchValue: search,
    onSearch = () => {},
    searchTip = 'Search',
    children,
    isSeparated,
}) => {
    const [searchExpanded, setSearchExpanded] = useState(Boolean(search));
    const [searchInputState, setSearchInputState] = useState(search);
    const [animating, setAnimating] = useState(false);
    const debouncedOnSearch = useAsyncDebounce(onSearch, 200);

    const { classes: styles } = useStyles();

    const onBlur = (clear = false) => {
        if (!searchInputState || clear) {
            setSearchExpanded(false);
        }
    };

    const onSearchChange = (value: string) => {
        debouncedOnSearch(value);
        setSearchInputState(value);
    };

    return (
        <div className={styles.tableActions}>
            <ConditionallyRender
                condition={Boolean(onSearch)}
                show={
                    <>
                        <AnimateOnMount
                            mounted={searchExpanded}
                            start={styles.fieldWidth}
                            enter={styles.fieldWidthEnter}
                            leave={styles.fieldWidthLeave}
                            onStart={() => setAnimating(true)}
                            onEnd={() => setAnimating(false)}
                        >
                            <TableSearchField
                                value={searchInputState!}
                                onChange={onSearchChange}
                                placeholder={`${searchTip}...`}
                                onBlur={onBlur}
                            />
                        </AnimateOnMount>
                        <ConditionallyRender
                            condition={!searchExpanded && !animating}
                            show={
                                <Tooltip title={searchTip} arrow>
                                    <IconButton
                                        aria-label={searchTip}
                                        onClick={() => setSearchExpanded(true)}
                                        size="large"
                                    >
                                        <Search />
                                    </IconButton>
                                </Tooltip>
                            }
                        />
                    </>
                }
            />
            {children}
        </div>
    );
};
