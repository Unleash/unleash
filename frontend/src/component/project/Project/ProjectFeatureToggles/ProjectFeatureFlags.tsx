import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { Table, TableCell } from '../../../common/Table';
import { TableBody, TableHead, TableRow } from '@mui/material';
import { useState } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';

interface DataItem {
    name: string;
    type: string;
}

const RowRenderer: React.FC<ListChildComponentProps> = ({ index, style, data }) => {
    const row = (data as DataItem[])[index];
    return (
        <TableRow
            key={row.name}
        >
            <TableCell>
                {row.name}
            </TableCell>
            <TableCell>{row.type}</TableCell>
        </TableRow>
    );
};

export const ProjectFeatureFlags = () => {
    const [cursor, setCursor] = useState('');
    const { features, loading } = useFeatureSearch(cursor);

    return <Table>
        <TableHead onClick={() => {
            if (features.length) {
                setCursor(features[features.length - 1].createdAt);
            }
        }}>
            <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                {/* ... other columns with sorting ... */}
            </TableRow>
        </TableHead>
        <TableBody>
            <List
                height={400} // Adjust as needed
                itemCount={features.length}
                itemSize={50} // Height of each row. Adjust as needed.
                width="100%"
                itemData={features}
            >
                {RowRenderer}
            </List>
        </TableBody>
    </Table>;
};
