import { Box, Typography, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { Truncator } from 'component/common/Truncator/Truncator';
import type { StrategyVariantSchema } from 'openapi';

const StyledContainer = styled(Box)(() => ({
    display: 'flex',
    width: '100%',
    position: 'relative',
}));

const StyledSegment = styled(Box)(() => ({
    position: 'relative',
}));

const StyledSegmentInfo = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'hasError',
})<{ hasError?: boolean }>(({ theme, hasError }) => ({
    width: '100%',
    top: 0,
    position: 'absolute',
    padding: theme.spacing(0, 0.125),
    fontSize: theme.fontSizes.smallerBody,
    overflow: 'hidden',
    color: hasError ? theme.palette.error.main : 'inherit',
}));

const StyledSegmentTrack = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'index' && prop !== 'isLast',
})<{ index: number; isLast: boolean }>(({ theme, index, isLast }) => ({
    height: theme.spacing(2),
    width: '100%',
    position: 'relative',
    background: theme.palette.variants[index % theme.palette.variants.length],
    ...(index === 0
        ? {
              borderTopLeftRadius: theme.shape.borderRadius,
              borderBottomLeftRadius: theme.shape.borderRadius,
          }
        : {}),
    ...(isLast
        ? {
              borderTopRightRadius: theme.shape.borderRadius,
              borderBottomRightRadius: theme.shape.borderRadius,
          }
        : {}),
}));

const StyledHeaderContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    marginY: theme.spacing(1),
}));

const StyledVariantBox = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'index',
})<{ index: number }>(({ theme, index }) => ({
    display: 'flex',
    alignItems: 'center',
    '& div': {
        width: theme.spacing(1.6),
        height: theme.spacing(1.6),
        borderRadius: '50%',
        background:
            theme.palette.variants[index % theme.palette.variants.length],
    },
}));

interface ISplitPreviewSliderProps {
    variants: StrategyVariantSchema[];
    weightsError?: boolean;
}

export const VariantsSplitPreview = ({
    variants,
    weightsError,
}: ISplitPreviewSliderProps) => {
    if (variants.length < 1) {
        return null;
    }

    return (
        <Box sx={(theme) => ({ marginTop: theme.spacing(2) })}>
            <SplitPreviewHeader variants={variants} />
            <StyledContainer>
                {variants.map((variant, index) => {
                    const value = variant.weight / 10;
                    if (value === 0) {
                        return null;
                    }
                    return (
                        <TooltipResolver
                            variant='custom'
                            key={index}
                            arrow
                            onClick={(e) => e.preventDefault()}
                            titleComponent={
                                <SplitPreviewTooltip
                                    variant={variant}
                                    index={index}
                                />
                            }
                        >
                            <StyledSegment sx={{ width: `${value}%` }}>
                                <StyledSegmentTrack
                                    index={index}
                                    isLast={index === variants.length - 1}
                                />
                                <StyledSegmentInfo hasError={weightsError}>
                                    {value >= 5 ? (
                                        <Truncator
                                            lines={1}
                                        >{`${value}%${value >= 10 ? ` – ${variant.name}` : ` `}`}</Truncator>
                                    ) : (
                                        <>…</>
                                    )}
                                </StyledSegmentInfo>
                            </StyledSegment>
                        </TooltipResolver>
                    );
                })}
            </StyledContainer>
        </Box>
    );
};

const SplitPreviewHeader = ({ variants }: ISplitPreviewSliderProps) => {
    return (
        <StyledHeaderContainer>
            <StyledTypography variant='body2'>
                Flag variants ({variants.length})
            </StyledTypography>
        </StyledHeaderContainer>
    );
};

interface ISplitPreviewTooltip {
    variant: StrategyVariantSchema;
    index: number;
}

const StyledTooltipContainer = styled(Box)(() => ({
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
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
}));

const StyledPayloadLabel = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const SplitPreviewTooltip = ({ variant, index }: ISplitPreviewTooltip) => {
    return (
        <StyledTooltipContainer>
            <StyledVariantContainer>
                <StyledVariantBox index={index}>
                    <Box />
                </StyledVariantBox>

                <Typography variant='subtitle2'>
                    {variant.weight / 10}% - {variant.name}
                </Typography>
            </StyledVariantContainer>

            {variant.payload ? (
                <StyledPayloadContainer>
                    <StyledPayloadLabel variant='body2'>
                        Payload
                    </StyledPayloadLabel>

                    <ConditionallyRender
                        condition={variant.payload.type === 'json'}
                        show={<code>{variant.payload.value}</code>}
                        elseShow={
                            <Typography variant='body2'>
                                {variant.payload.value}
                            </Typography>
                        }
                    />
                </StyledPayloadContainer>
            ) : null}
        </StyledTooltipContainer>
    );
};
