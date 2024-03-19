import { Box } from '@mui/material';
import type { FC } from 'react';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

export const FeatureFlagNamingTooltip: FC = () => {
    return (
        <HelpIcon
            htmlTooltip
            tooltip={
                <Box>
                    <p>
                        For example, the pattern{' '}
                        <code>{'[a-z0-9]{2}\\.[a-z]{4,12}'}</code> matches
                        'a1.project', but not 'a1.project.feature-1'.
                    </p>
                </Box>
            }
        />
    );
};
