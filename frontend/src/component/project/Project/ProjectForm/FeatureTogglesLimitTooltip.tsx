import { Box } from '@mui/material';
import { FC } from 'react';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

export const FeatureTogglesLimitTooltip: FC = () => (
    <HelpIcon
        htmlTooltip
        tooltip={
            <Box>
                Enforce an upper limit of the number of feature toggles that may
                be created for this project. You can create unlimited feature
                toggle if there is no limit set.
            </Box>
        }
    />
);
