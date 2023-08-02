import { VFC } from 'react';
import { ReactComponent as ProPlanIcon } from 'assets/icons/pro-enterprise-feature-badge.svg';
import { ReactComponent as ProPlanIconLight } from 'assets/icons/pro-enterprise-feature-badge-light.svg';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { Box } from '@mui/material';

export const EnterpriseBadge: VFC = () => {
    return (
        <Box
            sx={theme => ({
                marginLeft: 'auto',
                paddingLeft: theme.spacing(2),
                display: 'flex',
            })}
        >
            <ThemeMode
                darkmode={<ProPlanIconLight width={16} height={16} />}
                lightmode={<ProPlanIcon width={16} height={16} />}
            />
        </Box>
    );
};
