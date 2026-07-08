import { Box } from '@mui/material';
import Input from 'component/common/Input/Input';
import type { FC } from 'react';

interface IFeatureStrategyTitleProps {
    title: string;
    setTitle: (title: string) => void;
}

export const FeatureStrategyTitle: FC<IFeatureStrategyTitleProps> = ({
    title,
    setTitle,
}) => {
    return (
        <Box sx={{ paddingBottom: (theme) => theme.spacing(2) }}>
            <Input
                label='Strategy title'
                id='title-input'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ width: '100%' }}
            />
        </Box>
    );
};
