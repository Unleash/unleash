import { IconButton } from '@mui/material';
import Download from '@mui/icons-material/Download';
import { useAccessOverviewApi } from 'hooks/api/actions/useAccessOverviewApi/useAccessOverviewApi';

export const AccessOverview = () => {
    const { downloadCSV } = useAccessOverviewApi();

    return (
        <IconButton onClick={downloadCSV}>
            <Download />
        </IconButton>
    );
};
