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
    right: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(1),
    opacity: 0,
    transition: 'opacity 0.1s ease-in-out',
}));

const StyledCard = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
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
    position: 'relative',
    '&:hover .cardContent, &:focus-within .cardContent': {
        opacity: 0.5,
    },
    '&:hover .buttonContainer, &:focus-within .buttonContainer': {
        opacity: 1,
    },
}));

const StyledTopRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
}));

interface IFeatureReleasePlanCardProps {
    template: IReleasePlanTemplate;
    onClick: () => void;
    onPreviewClick: (e: React.MouseEvent) => void;
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
        onPreviewClick(e);
    };

    return (
        <StyledCard>
            <CardContent className='cardContent'>
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

            <HoverButtonsContainer className='buttonContainer'>
                <Button
                    variant='contained'
                    size='small'
                    onClick={handleUseClick}
                    tabIndex={0}
                >
                    Use
                </Button>
                <Button
                    variant='outlined'
                    size='small'
                    onClick={handlePreviewClick}
                >
                    Preview
                </Button>
            </HoverButtonsContainer>
        </StyledCard>
    );
};
