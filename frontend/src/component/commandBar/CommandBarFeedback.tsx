import { Button, styled, TextField } from '@mui/material';
import type React from 'react';
import { useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUserFeedbackApi } from 'hooks/api/actions/useUserFeedbackApi/useUserFeedbackApi';
import useToast from 'hooks/useToast';
import useUserType from '../feedbackNew/useUserType.ts';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    gap: theme.spacing(1),
}));

const StyledText = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
}));

const StyledButton = styled(Button)(({ theme }) => ({
    fontSize: theme.spacing(1.5),
}));

interface ICommandBarFeedbackProps {
    onSubmit: () => void;
}

export const CommandBarFeedback = ({ onSubmit }: ICommandBarFeedbackProps) => {
    const userType = useUserType();
    const { addFeedback } = useUserFeedbackApi();
    const { setToastData } = useToast();
    const [suggesting, setSuggesting] = useState(false);
    const [feedback, setFeedback] = useState<string | undefined>(undefined);

    const changeFeedback = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFeedback(event.target.value.trim());
    };

    const sendFeedback = async () => {
        await addFeedback({
            areasForImprovement: feedback,
            category: 'commandBar',
            userType: userType,
        });
        onSubmit();
        setToastData({
            text: 'Feedback sent',
            type: 'success',
        });
    };
    return (
        <StyledContainer>
            <ConditionallyRender
                condition={suggesting}
                show={
                    <>
                        <StyledText>Describe the capability</StyledText>
                        <TextField
                            multiline={true}
                            minRows={2}
                            onChange={changeFeedback}
                        />
                        <StyledButton
                            type='submit'
                            variant='contained'
                            color='primary'
                            onClick={sendFeedback}
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
