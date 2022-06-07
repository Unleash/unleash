import { IGetSearchContextOutput } from 'hooks/useSearch';
import { FC, useState } from 'react';
import { useAsyncDebounce } from 'react-table';
import { TableSearchField } from './TableSearchField/TableSearchField';

interface ITableSearchProps {
    initialValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    hasFilters?: boolean;
    getSearchContext?: () => IGetSearchContextOutput;
}

export const TableSearch: FC<ITableSearchProps> = ({
    initialValue,
    onChange = () => {},
    placeholder,
    hasFilters,
    getSearchContext,
}) => {
    const [searchInputState, setSearchInputState] = useState(initialValue);
    const debouncedOnSearch = useAsyncDebounce(onChange, 200);

    const onSearchChange = (value: string) => {
        debouncedOnSearch(value);
        setSearchInputState(value);
    };

    return (
        <TableSearchField
            value={searchInputState!}
            onChange={onSearchChange}
            placeholder={placeholder}
            hasFilters={hasFilters}
            getSearchContext={getSearchContext}
        />
    );
};
