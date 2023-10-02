import { Chip, styled } from '@mui/material';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';

interface ISingleValueProps {
    value: string | undefined;
    operator: string;
}

const StyledDiv = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down(600)]: { flexDirection: 'column' },
}));

const StyledParagraph = styled('p')(({ theme }) => ({
    marginRight: theme.spacing(1.5),
    [theme.breakpoints.down(600)]: {
        marginBottom: theme.spacing(1.5),
        marginRight: 0,
    },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    margin: theme.spacing(0, 1, 1, 0),
}));

export const SingleValue = ({ value, operator }: ISingleValueProps) => {
    if (!value) return null;

    return (
        <StyledDiv>
            <StyledParagraph>Value must be {operator}</StyledParagraph>{' '}
            <StyledChip
                label={
                    <StringTruncator
                        maxWidth="400"
                        text={value}
                        maxLength={50}
                    />
                }
            />
        </StyledDiv>
    );
};
