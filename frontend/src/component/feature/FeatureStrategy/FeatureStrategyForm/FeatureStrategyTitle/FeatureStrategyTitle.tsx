import { Box } from '@mui/material';
import type { FC } from 'react';
import { BorderlessInput } from 'component/common/Input/BorderlessInput';

interface IFeatureStrategyTitleProps {
    title: string;
    setTitle: (title: string) => void;
}

export const FeatureStrategyTitle: FC<IFeatureStrategyTitleProps> = ({
    title,
    setTitle,
}) => (
    <Box sx={{ paddingBottom: (theme) => theme.spacing(2) }}>
        <BorderlessInput
            variant='standard'
            placeholder='Untitled strategy'
            id='title-input'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            slotProps={{
                htmlInput: {
                    sx: (theme) => theme.typography.h1,
                },
            }}
            fullWidth
        />
    </Box>
);
