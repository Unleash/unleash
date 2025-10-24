import type { TableState } from '../ChangeRequests.types';
import type { makeStyledChip } from './ChangeRequestFilters.styles';

export type ChangeRequestFiltersProps = {
    tableState: Readonly<TableState>;
    setTableState: (update: Partial<TableState>) => void;
    userId: number;
    ariaControlTarget: string;
};

export type FilterChipsProps = {
    tableState: ChangeRequestFiltersProps['tableState'];
    setTableState: ChangeRequestFiltersProps['setTableState'];
    StyledChip: ReturnType<typeof makeStyledChip>;
};
