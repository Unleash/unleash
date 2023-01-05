import { Box, Button, styled, TextField } from '@mui/material';
import React, { useState } from 'react';
import produce from 'immer';
import useToast from 'hooks/useToast';
import { IFeedbackCESState } from 'component/feedback/FeedbackCESContext/FeedbackCESContext';
import { FeedbackCESScore } from 'component/feedback/FeedbackCES/FeedbackCESScore';
import { sendFeedbackInput } from 'component/feedback/FeedbackCES/sendFeedbackInput';

export interface IFeedbackCESFormProps {
    state: IFeedbackCESState;
    onClose: () => void;
}

export interface IFeedbackCESForm {
    score: number;
    comment: string;
    path: string;
}

const StyledContainer = styled('div')(({ theme }) => ({
    fontWeight: theme.fontWeight.thin,
}));

const StyledTitle = styled('h1')(({ theme }) => ({
    all: 'unset',
    display: 'block',
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const StyledForm = styled('form')(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(6),
    gridTemplateColumns: 'minmax(auto, 40rem)',
    justifyContent: 'center',
}));

const StyledSubtitle = styled('p')(({ theme }) => ({
    all: 'unset',
    display: 'block',
    marginTop: theme.spacing(5),
    fontSize: theme.spacing(3),
    textAlign: 'center',
}));

const StyledTextLabel = styled('label')(({ theme }) => ({
    display: 'block',
    marginBottom: theme.spacing(1),
}));

export const FeedbackCESForm = ({ state, onClose }: IFeedbackCESFormProps) => {
    const [loading, setLoading] = useState(false);
    const { setToastData } = useToast();

    const [form, setForm] = useState<Partial<IFeedbackCESForm>>({
        path: state.path,
    });

    const onCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setForm(
            produce(draft => {
                draft.comment = event.target.value;
            })
        );
    };

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        try {
            setLoading(true);
            await sendFeedbackInput(form);
            setToastData({
                type: 'success',
                title: 'Feedback sent. Thank you!',
                confetti: true,
            });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledContainer>
            <StyledTitle>Please help us improve</StyledTitle>
            <StyledForm onSubmit={onSubmit} aria-live="polite">
                <StyledSubtitle>{state.title}</StyledSubtitle>
                <FeedbackCESScore form={form} setForm={setForm} />
                <div hidden={!form.score}>
                    <StyledTextLabel htmlFor="comment">
                        {state.text}
                    </StyledTextLabel>
                    <TextField
                        value={form.comment ?? ''}
                        onChange={onCommentChange}
                        multiline
                        rows={3}
                        variant="outlined"
                        fullWidth
                    />
                </div>
                <Box hidden={!form.score} sx={{ textAlign: 'center' }}>
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        sx={{ minWidth: '15rem' }}
                        disabled={!form.score || loading}
                    >
                        Send feedback
                    </Button>
                </Box>
            </StyledForm>
        </StyledContainer>
    );
};
