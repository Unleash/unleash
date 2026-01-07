import { Box, Typography, styled } from '@mui/material';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { Truncator } from 'component/common/Truncator/Truncator';
import type { StrategyVariantSchema } from 'openapi';
import { SplitPreviewTooltip } from './SplitPreviewTooltip/SplitPreviewTooltip.tsx';

const StyledContainer = styled(Box)(() => ({
    display: 'flex',
    width: '100%',
    position: 'relative',
}));

const StyledVariantItem = styled(Box)<{ selected?: boolean }>(
    ({ theme, selected }) => ({
        position: 'relative',
        fontSize: theme.fontSizes.smallerBody,
        ...(selected
            ? {
                  fontWeight: theme.typography.fontWeightBold,
              }
            : {}),
    }),
);

const StyledVariantItemTrack = styled(Box, {
    shouldForwardProp: (prop) =>
        !['index', 'hasError', 'isFirst', 'isLast'].includes(prop as string),
})<{
    index: number;
    hasError?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
}>(({ theme, index, hasError, isFirst, isLast }) => ({
    height: theme.spacing(2),
    width: '100%',
    position: 'relative',
    color: hasError ? theme.palette.error.main : 'inherit',
    background: theme.palette.variants[index % theme.palette.variants.length],
    ...(isFirst
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

const StyledTrackPercentage = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0.25, 0.25),
    lineHeight: 1,
}));

const StyledVariantItemInfo = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0.125, 0.25, 0),
    overflow: 'hidden',
    color: theme.palette.text.secondary,
}));

const StyledHeaderContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    marginY: theme.spacing(1),
}));

type VariantsSplitPreviewProps = {
    variants: StrategyVariantSchema[];
    weightsError?: boolean;
    header?: boolean;
    selected?: string;
};

export const VariantsSplitPreview = ({
    variants,
    weightsError,
    header = true,
    selected,
}: VariantsSplitPreviewProps) => {
    if (variants.length < 1) {
        return null;
    }

    return (
        <Box sx={(theme) => ({ marginTop: theme.spacing(header ? 2 : 0) })}>
            {header ? (
                <StyledHeaderContainer>
                    <StyledTypography variant='body2'>
                        Flag variants ({variants.length})
                    </StyledTypography>
                </StyledHeaderContainer>
            ) : null}
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
                                    selected={selected === variant.name}
                                />
                            }
                        >
                            <StyledVariantItem
                                sx={{ width: `${value}%` }}
                                selected={selected === variant.name}
                            >
                                <StyledVariantItemTrack
                                    index={index}
                                    isFirst={index === 0}
                                    isLast={index === variants.length - 1}
                                    hasError={weightsError}
                                >
                                    <StyledTrackPercentage>
                                        <Truncator lines={1}>
                                            {`${value}%`}
                                        </Truncator>
                                    </StyledTrackPercentage>
                                </StyledVariantItemTrack>
                                <StyledVariantItemInfo>
                                    <Truncator lines={1}>
                                        {variant.name}
                                    </Truncator>
                                </StyledVariantItemInfo>
                            </StyledVariantItem>
                        </TooltipResolver>
                    );
                })}
            </StyledContainer>
        </Box>
    );
};
