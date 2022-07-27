import { Button, Card, CardContent, Typography } from '@mui/material';
import { FC } from 'react';

interface IPresetCardProps {
    title: string;
    onClick: () => void;
}

export const PresetCard: FC<IPresetCardProps> = ({
    title,
    children,
    onClick,
}) => (
    <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent
            sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
        >
            <Typography variant="body1" fontWeight="medium" sx={{ mb: 0.5 }}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" component="p">
                {children}
            </Typography>

            <Button
                variant="outlined"
                size="small"
                sx={{ ml: 'auto', mt: 'auto' }}
                onClick={onClick}
            >
                Use template
            </Button>
        </CardContent>
    </Card>
);
