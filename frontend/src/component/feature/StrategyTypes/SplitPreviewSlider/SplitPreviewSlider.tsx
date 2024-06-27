import { Box, Typography, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import type { IFeatureVariant } from 'interfaces/featureToggle';

const StyledContainer = styled(Box)(() => ({
    display: 'flex',
    width: '100%',
    position: 'relative',
}));

const StyledTrack = styled(Box)(({ theme }) => ({
    position: 'absolute',
    height: theme.spacing(3),
    width: '100%',
    display: 'flex',
    overflow: 'hidden',
}));

const StyledSegment = styled(Box)(() => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
}));

const StyledSegmentTrack = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'index',
})<{ index: number }>(({ theme, index }) => ({
    height: theme.spacing(1.8),
    width: '100%',
    position: 'relative',
    background: theme.palette.variants[index % theme.palette.variants.length],
}));

const StyledHeaderContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    marginY: theme.spacing(1),
}));

const StyledVariantBoxContainer = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
}));

const StyledVariantBox = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'index',
})<{ index: number }>(({ theme, index }) => ({
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(2),
    '& div': {
        width: theme.spacing(1.6),
        height: theme.spacing(1.6),
        borderRadius: '50%',
        marginRight: theme.spacing(1),
        background:
            theme.palette.variants[index % theme.palette.variants.length],
    },
}));

const StyledTypographySubtitle = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(1),
}));

interface ISplitPreviewSliderProps {
    variants: IFeatureVariant[];
    weightsError?: boolean;
}

const SplitPreviewSlider = ({
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
                <StyledTrack />

                {variants.map((variant, index) => {
                    const value = variant.weight / 10;
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
                            <Box
                                style={{
                                    width: `${value}%`,
                                }}
                            >
                                {' '}
                                <StyledSegment>
                                    <StyledSegmentTrack index={index} />
                                    <StyledTypographySubtitle
                                        variant='subtitle2'
                                        color={
                                            weightsError ? 'error' : 'inherit'
                                        }
                                    >
                                        {value}%
                                    </StyledTypographySubtitle>
                                </StyledSegment>
                            </Box>
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
                Feature variants ({variants.length})
            </StyledTypography>
            <StyledVariantBoxContainer>
                {variants.map((variant, index) => (
                    <StyledVariantBox key={index} index={index}>
                        <Box />
                        <StyledTypography variant='body2'>
                            {variant.name}
                        </StyledTypography>
                    </StyledVariantBox>
                ))}
            </StyledVariantBoxContainer>
        </StyledHeaderContainer>
    );
};

interface ISplitPreviewTooltip {
    variant: IFeatureVariant;
    index: number;
}

const StyledTooltipContainer = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

const StyledVariantContainer = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    minWidth: '250px',
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

export default SplitPreviewSlider;
