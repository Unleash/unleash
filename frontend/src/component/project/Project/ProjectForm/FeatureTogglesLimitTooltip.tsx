import { Box } from '@mui/material';
import type { FC } from 'react';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

export const FeatureTogglesLimitTooltip: FC = () => (
    <HelpIcon
        htmlTooltip
        tooltip={
            <Box>
                Enforce an upper limit of the number of feature flags that may
                be created for this project. You can create unlimited feature
                flag if there is no limit set.
            </Box>
        }
    />
);
