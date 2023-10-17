import { Button, Typography, styled } from '@mui/material';
import { SegmentsDialog } from './SegmentsDialog';
import ossSegmentsImage from 'assets/img/ossSegments.png';
import { formatAssetPath } from 'utils/formatPath';
import { Launch } from '@mui/icons-material';

const StyledActions = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(3),
    marginBlockStart: theme.spacing(5),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    height: theme.spacing(7),
}));

interface SegmentsSplashScreenProps {
    open: boolean;
    onClose: () => void;
    showSegments: () => void;
}

const StyledHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: theme.fontWeight.bold,
}));

const StyledImage = styled('img')(({ theme }) => ({
    width: '100%',
    marginBlockStart: theme.spacing(3),
}));

const StyledLink = styled('a')(({ theme }) => ({
    marginBlockStart: theme.spacing(3),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'underline',
    gap: theme.spacing(0.5),
    '& > svg': {
        fontSize: theme.fontSizes.bodySize,
    },
}));

export const SegmentsSplashScreen = ({
    open,
    onClose,
    showSegments,
}: SegmentsSplashScreenProps) => (
    <>
        <SegmentsDialog open={open} onClose={onClose}>
            <StyledHeader>
                Segments are now available in Open Source!
            </StyledHeader>
            <Typography color='textSecondary' sx={{ mt: 2 }}>
                We are excited to announce that we are releasing an enterprise
                feature for our open source community
            </Typography>
            <StyledImage
                src={formatAssetPath(ossSegmentsImage)}
                alt='The segment creation screen, showing an example segment consisting of three constraints.'
            />
            <StyledLink href={'https://docs.getunleash.io/reference/segments'}>
                Read all about segments in the documentation
                <Launch />
            </StyledLink>

            <StyledActions>
                <StyledButton
                    variant='contained'
                    color='primary'
                    onClick={showSegments}
                >
                    Show me segments
                </StyledButton>
                <StyledButton
                    variant='outlined'
                    color='primary'
                    onClick={onClose}
                >
                    Close
                </StyledButton>
            </StyledActions>
        </SegmentsDialog>
    </>
);
