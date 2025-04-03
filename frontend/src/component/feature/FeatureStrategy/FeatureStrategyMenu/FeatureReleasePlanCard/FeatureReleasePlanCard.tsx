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
    '&:hover, &:focus': {
        borderColor: theme.palette.primary.main,
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
}

export const FeatureReleasePlanCard = ({
    template: { name, description },
    onClick,
}: IFeatureReleasePlanCardProps) => {
    const Icon = getFeatureStrategyIcon('releasePlanTemplate');

    return (
        <StyledCard onClick={onClick}>
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
                    fontWeight: (theme) => theme.typography.fontWeightRegular,
                    width: '100%',
                }}
            >
                {description}
            </Truncator>
        </StyledCard>
    );
};
