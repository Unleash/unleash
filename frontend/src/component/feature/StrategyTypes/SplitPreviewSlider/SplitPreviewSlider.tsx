import { Box, Typography, styled } from '@mui/material';

type SplitPreviewSliderProps = {
    values: number[];
};

const StyledContainer = styled(Box)(({ theme }) => ({
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

const StyledSegment = styled(Box)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));

const StyledSegmentTrack = styled(Box)(({ theme }) => ({
    height: theme.spacing(3),
    width: '100%',
    position: 'relative',
}));

const SplitPreviewSlider = ({ values }: SplitPreviewSliderProps) => {
    if (values.length < 2) {
        return null;
    }

    return (
        <Box sx={theme => ({ marginTop: theme.spacing(2) })}>
            <Typography
                variant="body2"
                sx={theme => ({ marginY: theme.spacing(1) })}
            >
                Split preview
            </Typography>
            <StyledContainer>
                <StyledTrack />
                {values.map((value, index) => (
                    <StyledSegment key={index} sx={{ width: `${value}%` }}>
                        <StyledSegmentTrack
                            sx={theme => ({
                                background:
                                    theme.palette.variants[
                                        index % theme.palette.variants.length
                                    ],
                            })}
                        />
                        <Typography
                            variant="subtitle2"
                            sx={theme => ({ marginTop: theme.spacing(1) })}
                        >
                            {value}%
                        </Typography>
                    </StyledSegment>
                ))}
            </StyledContainer>
        </Box>
    );
};

export default SplitPreviewSlider;
