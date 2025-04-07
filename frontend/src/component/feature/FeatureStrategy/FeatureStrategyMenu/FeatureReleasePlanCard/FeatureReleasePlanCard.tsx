import { getFeatureStrategyIcon } from 'utils/strategyNames';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { Button, styled } from '@mui/material';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { Truncator } from 'component/common/Truncator/Truncator';

const StyledIcon = styled('div')(({ theme }) => ({
    width: theme.spacing(3),
    '& > svg': {
        width: theme.spacing(2.25),
        height: theme.spacing(2.25),
        fill: theme.palette.primary.main,
    },
}));

const StyledName = styled(StringTruncator)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.caption.fontSize,
    display: 'block',
    marginBottom: theme.spacing(0.5),
}));

const CardContent = styled('div')(({ theme }) => ({
    width: '100%',
    transition: 'opacity 0.2s ease-in-out',
}));

const HoverButtonsContainer = styled('div')(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    right: theme.spacing(2),
    transform: 'translateY(-50%)',
    display: 'flex',
    gap: theme.spacing(1),
    opacity: 0,
    visibility: 'hidden',
    transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out',
}));

const StyledCard = styled(Button)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '30rem',
    padding: theme.spacing(1.5, 2),
    color: 'inherit',
    textDecoration: 'inherit',
    lineHeight: 1.25,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
    borderRadius: theme.spacing(1),
    textAlign: 'left',
    overflow: 'hidden',
    [`&:hover ${CardContent}`]: {
        opacity: 0.5,
    },
    [`&:hover ${HoverButtonsContainer}`]: {
        opacity: 1,
        visibility: 'visible',
    },
}));

const StyledTopRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
}));

const UseButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

const PreviewButton = styled(Button)(({ theme }) => ({
    backgroundColor: 'transparent',
    border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

interface IFeatureReleasePlanCardProps {
    template: IReleasePlanTemplate;
    onClick: () => void;
    onPreviewClick?: (e: React.MouseEvent) => void;
}

export const FeatureReleasePlanCard = ({
    template: { name, description },
    onClick,
    onPreviewClick,
}: IFeatureReleasePlanCardProps) => {
    const Icon = getFeatureStrategyIcon('releasePlanTemplate');

    const handleUseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
    };

    const handlePreviewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onPreviewClick) {
            onPreviewClick(e);
        }
    };

    return (
        <StyledCard>
            <CardContent>
                <StyledTopRow>
                    <StyledIcon>
                        <Icon />
                    </StyledIcon>
                    <StyledName text={name} maxWidth='200' maxLength={25} />
                </StyledTopRow>
                <Truncator
                    lines={1}
                    title={description}
                    arrow
                    sx={{
                        fontSize: (theme) => theme.typography.caption.fontSize,
                        fontWeight: (theme) =>
                            theme.typography.fontWeightRegular,
                        width: '100%',
                    }}
                >
                    {description}
                </Truncator>
            </CardContent>

            <HoverButtonsContainer>
                <UseButton
                    variant='contained'
                    size='small'
                    onClick={handleUseClick}
                >
                    Use
                </UseButton>
                <PreviewButton
                    variant='outlined'
                    size='small'
                    onClick={handlePreviewClick}
                >
                    Preview
                </PreviewButton>
            </HoverButtonsContainer>
        </StyledCard>
    );
};
