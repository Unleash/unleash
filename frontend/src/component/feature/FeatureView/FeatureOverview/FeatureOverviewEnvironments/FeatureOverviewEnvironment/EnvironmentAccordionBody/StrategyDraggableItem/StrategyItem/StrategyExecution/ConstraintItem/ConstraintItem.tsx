import { Chip, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';

interface IConstraintItemProps {
    value: string[];
    text: string;
}

const StyledContainer = styled('div')(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(2, 3),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
}));

const StyledParagraph = styled('p')(({ theme }) => ({
    display: 'inline',
    margin: theme.spacing(0.5, 0),
    maxWidth: '95%',
    textAlign: 'center',
    wordBreak: 'break-word',
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    margin: theme.spacing(0.5),
}));

export const ConstraintItem = ({ value, text }: IConstraintItemProps) => {
    return (
        <StyledContainer>
            <ConditionallyRender
                condition={value.length === 0}
                show={<p>No {text}s added yet.</p>}
                elseShow={
                    <div>
                        <StyledParagraph>
                            {value.length}{' '}
                            {value.length > 1 ? `${text}s` : text} will get
                            access.
                        </StyledParagraph>
                        {value.map((v: string) => (
                            <StyledChip
                                key={v}
                                label={
                                    <StringTruncator
                                        maxWidth="300"
                                        text={v}
                                        maxLength={50}
                                    />
                                }
                            />
                        ))}
                    </div>
                }
            />
        </StyledContainer>
    );
};
