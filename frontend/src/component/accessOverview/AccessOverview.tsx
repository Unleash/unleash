import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { IconButton } from '@mui/material';
import { Download } from '@mui/icons-material';
import { useAccessOverviewApi } from 'hooks/api/actions/useAccessOverviewApi/useAccessOverviewApi';

export const AccessOverview = () => {
    const { downloadCSV } = useAccessOverviewApi();

    return (
        <IconButton onClick={downloadCSV}>
            <Download />
        </IconButton>
    );
};
