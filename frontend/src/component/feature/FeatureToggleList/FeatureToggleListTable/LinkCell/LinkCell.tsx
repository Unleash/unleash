import { VFC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';

interface ILinkCellProps {
    to: string;
    children?: string;
}

export const LinkCell: VFC<ILinkCellProps> = ({ children, to }) => {
    const search = useSearchHighlightContext();

    return (
        <Link component={RouterLink} to={to} data-loading underline="hover">
            <Highlighter search={search}>{children}</Highlighter>
        </Link>
    );
};
