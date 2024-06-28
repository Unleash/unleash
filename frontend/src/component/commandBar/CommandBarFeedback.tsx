import { Button, styled, TextField } from '@mui/material';
import { useState } from 'react';
import { ConditionallyRender } from '../common/ConditionallyRender/ConditionallyRender';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    gap: theme.spacing(1),
}));

const StyledText = styled('span')(({ theme }) => ({
    fontSize: theme.spacing(1.5),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    fontSize: theme.spacing(1.5),
}));

export const CommandBarFeedback = () => {
    const [suggesting, setSuggesting] = useState(false);
    return (
        <StyledContainer>
            <ConditionallyRender
                condition={suggesting}
                show={
                    <>
                        <StyledText>Describe the capability</StyledText>
                        <TextField minRows={3}>Test</TextField>
                        <StyledButton
                            type='submit'
                            variant='contained'
                            color='primary'
                            onClick={() => {}}
                        >
                            Send to Unleash
                        </StyledButton>
                    </>
                }
                elseShow={
                    <>
                        <StyledText>
                            We couldn’t find anything matching your search
                            criteria. If you think this is a missing capability,
                            feel free to make a suggestion.
                        </StyledText>
                        <StyledButton
                            type='submit'
                            variant='contained'
                            color='primary'
                            onClick={(e) => {
                                e.stopPropagation();
                                setSuggesting(true);
                            }}
                        >
                            Suggest capability
                        </StyledButton>
                    </>
                }
            />
        </StyledContainer>
    );
};
