import { useStyles } from 'component/feedback/FeedbackCES/FeedbackCESForm.styles';
import { Button, TextField } from '@material-ui/core';
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

export const FeedbackCESForm = ({ state, onClose }: IFeedbackCESFormProps) => {
    const [loading, setLoading] = useState(false);
    const { setToastData } = useToast();
    const styles = useStyles();

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
        <div className={styles.container}>
            <h1 className={styles.title}>Please help us improve</h1>
            <form
                className={styles.form}
                onSubmit={onSubmit}
                aria-live="polite"
            >
                <p className={styles.subtitle}>{state.title}</p>
                <FeedbackCESScore form={form} setForm={setForm} />
                <div hidden={!form.score}>
                    <label htmlFor="comment" className={styles.textLabel}>
                        {state.text}
                    </label>
                    <TextField
                        value={form.comment ?? ''}
                        onChange={onCommentChange}
                        multiline
                        rows={3}
                        variant="outlined"
                        fullWidth
                    />
                </div>
                <div className={styles.buttons} hidden={!form.score}>
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        className={styles.button}
                        disabled={!form.score || loading}
                    >
                        Send feedback
                    </Button>
                </div>
            </form>
        </div>
    );
};
