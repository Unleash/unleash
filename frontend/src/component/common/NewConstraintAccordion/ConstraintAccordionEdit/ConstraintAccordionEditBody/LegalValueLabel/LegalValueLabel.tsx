import type { ILegalValue } from 'interfaces/context';
import {
    StyledContainer,
    StyledValue,
    StyledDescription,
} from './LegalValueLabel.styles';
import type React from 'react';
import { FormControlLabel } from '@mui/material';

interface ILegalValueTextProps {
    legal: ILegalValue;
    control: React.ReactElement;
}

export const LegalValueLabel = ({ legal, control }: ILegalValueTextProps) => {
    return (
        <StyledContainer>
            <FormControlLabel
                value={legal.value}
                control={control}
                label={
                    <>
                        <StyledValue>{legal.value}</StyledValue>
                        <StyledDescription>
                            {legal.description}
                        </StyledDescription>
                    </>
                }
            />
        </StyledContainer>
    );
};

export const filterLegalValues = (
    legalValues: ILegalValue[],
    filter: string,
): ILegalValue[] => {
    return legalValues.filter((legalValue) => {
        return legalValue.value.includes(filter);
    });
};
