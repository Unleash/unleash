import { FiberManualRecord } from '@mui/icons-material';
import React from 'react';
import { styled } from '@mui/material';
import { formTemplateSidebarWidth } from '../common/FormTemplate/FormTemplate.styles';

interface ISegmentFormStepListProps {
    total: number;
    current: number;
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 30,
    left: 0,
    right: formTemplateSidebarWidth,
    [theme.breakpoints.down(1100)]: {
        right: 0,
    },
}));

const StyledSteps = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: 10,
    background: theme.palette.background.paper,
    padding: theme.spacing(1, 2.5),
    margin: 'auto',
    display: 'flex',
    alignItems: 'center',
}));

const StyledSpan = styled('span')(({ theme }) => ({
    marginRight: 15,
    fontSize: theme.fontSizes.smallBody,
}));

const StyledFiberManualRecord = styled(FiberManualRecord, {
    shouldForwardProp: prop => prop !== 'filled',
})<{ filled: boolean }>(({ theme, filled }) => ({
    fill: theme.palette.primary.main,
    transition: 'opacity 0.4s ease',
    opacity: filled ? 1 : 0.4,
    fontSize: filled ? 20 : 17,
}));

export const SegmentFormStepList: React.FC<ISegmentFormStepListProps> = ({
    total,
    current,
}) => {
    // Create a list with all the step numbers, e.g. [1, 2, 3].
    const steps: number[] = Array.from({ length: total }).map((_, i) => {
        return i + 1;
    });

    return (
        <StyledContainer>
            <StyledSteps>
                <StyledSpan>
                    Step {current} of {total}
                </StyledSpan>
                {steps.map(step => (
                    <StyledFiberManualRecord
                        key={step}
                        filled={step === current}
                    />
                ))}
            </StyledSteps>
        </StyledContainer>
    );
};
