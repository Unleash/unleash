import { ElementType, FC } from 'react';
import { Card, CardContent, Typography, styled, Box } from '@mui/material';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { CREATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';

interface IPresetCardProps {
    title: string;
    projectId: string;
    environmentId: string;
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
    projectId,
    environmentId,
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

            <Box
                sx={{
                    ml: 'auto',
                    mt: 'auto',
                    pt: 1,
                    mr: { xs: 'auto', sm: 0 },
                }}
            >
                <PermissionButton
                    permission={CREATE_FEATURE_STRATEGY}
                    projectId={projectId}
                    environmentId={environmentId}
                    variant="outlined"
                    size="small"
                    onClick={onClick}
                >
                    Use template
                </PermissionButton>
            </Box>
        </CardContent>
    </StyledCard>
);
