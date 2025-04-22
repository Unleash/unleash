import { getFeatureStrategyIcon } from 'utils/strategyNames';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { Button, styled } from '@mui/material';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';

const StyledIcon = styled('div')(({ theme }) => ({
    width: theme.spacing(4),
    height: 'auto',
    '& > svg': {
        fill: theme.palette.primary.main,
    },
    '& > div': {
        height: theme.spacing(2),
        marginLeft: '-.75rem',
        color: theme.palette.primary.main,
    },
}));

const StyledDescription = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.fontWeight.medium,
}));

const StyledName = styled(StringTruncator)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledCard = styled(Button)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '3rem 1fr',
    width: '20rem',
    padding: theme.spacing(2),
    color: 'inherit',
    textDecoration: 'inherit',
    lineHeight: 1.25,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
    borderRadius: theme.spacing(1),
    textAlign: 'left',
    '&:hover, &:focus': {
        borderColor: theme.palette.primary.main,
    },
}));

interface IFeatureReleasePlanCardProps {
    template: IReleasePlanTemplate;
    onClick: () => void;
}

export const OldFeatureReleasePlanCard = ({
    template: { name, description },
    onClick,
}: IFeatureReleasePlanCardProps) => {
    const Icon = getFeatureStrategyIcon('releasePlanTemplate');

    return (
        <StyledCard onClick={onClick}>
            <StyledIcon>
                <Icon />
            </StyledIcon>
            <div>
                <StyledName text={name} maxWidth='200' maxLength={25} />
                <StyledDescription>{description}</StyledDescription>
            </div>
        </StyledCard>
    );
};
