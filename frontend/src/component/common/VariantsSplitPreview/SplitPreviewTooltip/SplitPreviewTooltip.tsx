import { Box, styled, Typography } from '@mui/material';
import type { StrategyVariantSchema } from 'openapi';

const StyledTooltipContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
}));

const StyledVariantContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    minWidth: '250px',
    gap: theme.spacing(1),
}));

const StyledPayloadContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1, 0, 0.75, 0),
    flexDirection: 'column',
}));

const StyledPayloadLabel = styled('span')(({ theme }) => ({
    marginBottom: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize,
}));

const StyledVariantBox = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'index',
})<{ index: number }>(({ theme, index }) => ({
    display: 'flex',
    alignItems: 'center',
    figure: {
        margin: 0,
        padding: 0,
        width: theme.spacing(1.6),
        height: theme.spacing(1.6),
        borderRadius: '50%',
        background:
            theme.palette.variants[index % theme.palette.variants.length],
    },
}));

const StyledVariantType = styled('span')(({ theme }) => ({
    display: 'inline-block',
    background: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(0.25, 1),
    align: 'center',
    fontSize: theme.fontSizes.smallBody,
}));

const StyledVariantPayload = styled('code')(({ theme }) => ({
    display: 'inline-block',
    background: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(0.25, 1),
    fontSize: theme.fontSizes.smallerBody,
}));

type SplitPreviewTooltipProps = {
    variant: StrategyVariantSchema;
    index: number;
    selected?: boolean;
};

export const SplitPreviewTooltip = ({
    variant: { name, weight, payload },
    index,
    selected,
}: SplitPreviewTooltipProps) => (
    <StyledTooltipContainer>
        <StyledVariantContainer>
            <StyledVariantBox index={index}>
                <figure />
            </StyledVariantBox>

            <Typography variant='subtitle2'>
                {weight / 10}% - {name}
            </Typography>
        </StyledVariantContainer>

        {payload ? (
            <StyledPayloadContainer
                sx={{
                    display: ['json', 'csv'].includes(payload.type)
                        ? 'flex'
                        : 'block',
                }}
            >
                <StyledPayloadLabel>
                    <StyledVariantType>{payload.type}</StyledVariantType>
                    {' payload: '}
                </StyledPayloadLabel>
                <StyledVariantPayload>{payload.value}</StyledVariantPayload>
            </StyledPayloadContainer>
        ) : null}
    </StyledTooltipContainer>
);
