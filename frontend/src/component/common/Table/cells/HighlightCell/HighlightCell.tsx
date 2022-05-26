import { VFC } from 'react';
import { Box } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';

interface IHighlightCellProps {
    value?: string | null;
    children?: string | null;
}

export const HighlightCell: VFC<IHighlightCellProps> = ({
    value,
    children,
}) => {
    const { searchQuery } = useSearchHighlightContext();

    const text = children ?? value;
    if (!text) {
        return <Box sx={{ py: 1.5, px: 2 }} />;
    }

    return (
        <Box sx={{ py: 1.5, px: 2 }}>
            <span data-loading role="tooltip">
                <Highlighter search={searchQuery}>{text}</Highlighter>
            </span>
        </Box>
    );
};
