import { FC } from 'react';
import { Box } from '@mui/material';
import { TablePlaceholder } from 'component/common/Table';

interface ITablePlaceholderProps {
    show: boolean;
    query?: string;
}

export const TableEmptyState: FC<ITablePlaceholderProps> = ({
    show,
    query,
}) => {
    if (show !== true) {
        return null;
    }

    if ((query || '')?.length > 0) {
        return (
            <Box
                sx={(theme) => ({
                    padding: theme.spacing(3),
                })}
            >
                <TablePlaceholder>
                    No feature toggles found matching &ldquo;
                    {query}
                    &rdquo;
                </TablePlaceholder>
            </Box>
        );
    }

    return (
        <Box
            sx={(theme) => ({
                padding: theme.spacing(3),
            })}
        >
            <TablePlaceholder>
                No feature toggles available. Get started by adding a new
                feature toggle.
            </TablePlaceholder>
        </Box>
    );
};
