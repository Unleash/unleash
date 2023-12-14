import { FC } from 'react';
import { Box } from '@mui/material';
import { TablePlaceholder } from 'component/common/Table';

interface ITablePlaceholderProps {
    total?: number;
    query?: string;
}

export const Placeholder: FC<ITablePlaceholderProps> = ({ total, query }) => {
    if (total !== 0) {
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
