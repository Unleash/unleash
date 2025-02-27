import { styled } from '@mui/material';

interface IStrategySeparatorProps {
    text: 'AND' | 'OR';
}

const StyledOr = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.75, 1),
    fontSize: theme.fontSizes.smallerBody,
    position: 'absolute',
    zIndex: theme.zIndex.fab,
    top: 0,
    transform: 'translateY(-50%)',
    lineHeight: 1,
    borderRadius: theme.shape.borderRadiusLarge,
    fontWeight: 'bold',
    backgroundColor: theme.palette.background.alternative,
    color: theme.palette.primary.contrastText,
    left: theme.spacing(4),
}));

export const StrategySeparator = ({ text }: IStrategySeparatorProps) => {
    return <StyledOr>{text}</StyledOr>;
};
