import type { IConstraint } from 'interfaces/strategy';
import { formatOperatorDescription } from 'component/common/ConstraintAccordion/ConstraintOperator/formatOperatorDescription';
import { styled } from '@mui/material';

interface IConstraintOperatorProps {
    constraint: IConstraint;
    hasPrefix?: boolean;
    disabled?: boolean;
}

const StyledContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.elevation2,
    lineHeight: 1.25,
}));

const StyledName = styled('p', {
    shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled: boolean }>(({ theme, disabled }) => ({
    fontSize: theme.fontSizes.smallBody,
    lineHeight: 17 / 14,
    color: disabled ? theme.palette.text.secondary : theme.palette.text.primary,
}));

const StyledText = styled('p', {
    shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled: boolean }>(({ theme, disabled }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: disabled ? theme.palette.text.secondary : theme.palette.neutral.main,
}));

export const ConstraintOperator = ({
    constraint,
    hasPrefix,
    disabled = false,
}: IConstraintOperatorProps) => {
    const operatorName = constraint.operator;
    const operatorText = formatOperatorDescription(constraint.operator);

    return (
        <StyledContainer
            style={{
                borderTopLeftRadius: hasPrefix ? 0 : undefined,
                borderBottomLeftRadius: hasPrefix ? 0 : undefined,
                paddingLeft: hasPrefix ? 0 : undefined,
            }}
        >
            <StyledName disabled={disabled}>{operatorName}</StyledName>
            <StyledText disabled={disabled}>{operatorText}</StyledText>
        </StyledContainer>
    );
};
