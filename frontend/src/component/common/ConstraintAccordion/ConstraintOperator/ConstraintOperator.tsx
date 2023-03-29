import { IConstraint } from 'interfaces/strategy';
import { formatOperatorDescription } from 'component/common/ConstraintAccordion/ConstraintOperator/formatOperatorDescription';
import React from 'react';
import { styled } from '@mui/material';

interface IConstraintOperatorProps {
    constraint: IConstraint;
    hasPrefix?: boolean;
}

const StyledContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.elevation2,
    lineHeight: 1.25,
}));

const StyledName = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    lineHeight: 17 / 14,
}));

const StyledText = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.neutral.main,
}));

export const ConstraintOperator = ({
    constraint,
    hasPrefix,
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
            <StyledName>{operatorName}</StyledName>
            <StyledText>{operatorText}</StyledText>
        </StyledContainer>
    );
};
