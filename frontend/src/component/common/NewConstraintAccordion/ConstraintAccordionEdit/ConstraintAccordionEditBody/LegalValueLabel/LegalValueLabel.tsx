import type { ILegalValue } from 'interfaces/context';
import {
    StyledContainer,
    StyledValue,
    StyledDescription,
} from './LegalValueLabel.styles';
import type React from 'react';
import { FormControlLabel } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { Truncator } from 'component/common/Truncator/Truncator';

interface ILegalValueTextProps {
    legal: ILegalValue;
    control: React.ReactElement;
    filter?: string;
    value?: string;
}

export const LegalValueLabel = ({
    legal,
    control,
    filter,
    value,
}: ILegalValueTextProps) => {
    return (
        <StyledContainer>
            <FormControlLabel
                value={value || legal.value}
                control={control}
                sx={{
                    '.MuiFormControlLabel-label': {
                        overflowX: 'hidden',
                    },
                    width: '100%',
                    overflowX: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
                label={
                    <Truncator
                        title={
                            legal.value + legal.description
                                ? `: ${legal.description}`
                                : ''
                        }
                        arrow
                        lines={1}
                    >
                        <StyledValue>
                            <Highlighter search={filter}>
                                {legal.value}
                            </Highlighter>
                        </StyledValue>
                        <StyledDescription>
                            <Highlighter search={filter}>
                                {legal.description}
                            </Highlighter>
                        </StyledDescription>
                    </Truncator>
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
        return (
            legalValue.value.toLowerCase().includes(filter.toLowerCase()) ||
            legalValue.description?.toLowerCase().includes(filter.toLowerCase())
        );
    });
};
