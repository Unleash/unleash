import { useMemo } from 'react';
import { Avatar, CircularProgress, Icon, Link } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { styles as themeStyles } from 'component/common';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import useApplications from 'hooks/api/getters/useApplications/useApplications';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import {
    SortableTableHeader,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '../../common/Table';
import { useGlobalFilter, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import useUiConfig from '../../../hooks/api/getters/useUiConfig/useUiConfig';
import { ApplicationList } from './ApplicationList';
import { OldApplicationList } from './OldApplicationList';

export const TemporaryApplicationListWrapper = () => {
    const { uiConfig } = useUiConfig();

    return (
        <ConditionallyRender
            condition={Boolean(uiConfig.flags.newApplicationList)}
            show={<ApplicationList />}
            elseShow={<OldApplicationList />}
        />
    );
};
