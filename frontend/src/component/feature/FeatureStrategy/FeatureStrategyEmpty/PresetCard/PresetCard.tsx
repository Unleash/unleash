import { ElementType, FC } from 'react';
import { Button, Card, CardContent, styled, Typography } from '@mui/material';

interface IPresetCardProps {
    title: string;
    onClick: () => void;
    Icon: ElementType;
}

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadiusMedium,
}));

export const PresetCard: FC<IPresetCardProps> = ({
    title,
    children,
    Icon,
    onClick,
}) => (
    <StyledCard variant="outlined">
        <CardContent
            sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
        >
            <Typography
                variant="body1"
                fontWeight="medium"
                sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}
            >
                <Icon color="disabled" sx={{ mr: 1 }} /> {title}
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
    </StyledCard>
);
