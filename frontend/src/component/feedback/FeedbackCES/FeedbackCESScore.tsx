import React from 'react';
import produce from 'immer';
import { IFeedbackCESForm } from 'component/feedback/FeedbackCES/FeedbackCESForm';
import { styled } from '@mui/material';

interface IFeedbackCESScoreProps {
    form: Partial<IFeedbackCESForm>;
    setForm: React.Dispatch<React.SetStateAction<Partial<IFeedbackCESForm>>>;
}

const StyledScoreInput = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    margin: '0 auto',
}));

const StyledScoreHelp = styled('span')(({ theme }) => ({
    width: '6.25rem',
    whiteSpace: 'nowrap',
    color: theme.palette.text.secondary,
    '&:first-of-type': {
        textAlign: 'right',
    },
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    },
}));

const StyledScoreValue = styled('label')(({ theme }) => ({
    '& input': {
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        overflow: 'hidden',
        position: 'absolute',
        whiteSpace: 'nowrap',
        width: 1,
        height: 1,
    },
    '& span': {
        display: 'grid',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.divider,
        width: '3rem',
        height: '3rem',
        borderRadius: '10rem',
        fontSize: '1.25rem',
        paddingBottom: 2,
        userSelect: 'none',
        cursor: 'pointer',
    },
    '& input:checked + span': {
        fontWeight: theme.fontWeight.bold,
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    '& input:focus-visible + span': {
        outline: '2px solid',
        outlineOffset: 2,
        outlineColor: theme.palette.primary.main,
    },
}));

export const FeedbackCESScore = ({ form, setForm }: IFeedbackCESScoreProps) => {
    const onScoreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm(
            produce(draft => {
                draft.score = Number(event.target.value);
            })
        );
    };

    return (
        <StyledScoreInput>
            <StyledScoreHelp>Very difficult</StyledScoreHelp>
            {[1, 2, 3, 4, 5, 6, 7].map(score => (
                <StyledScoreValue key={score}>
                    <input
                        type="radio"
                        name="score"
                        value={score}
                        checked={form.score === score}
                        onChange={onScoreChange}
                    />
                    <span>{score}</span>
                </StyledScoreValue>
            ))}
            <StyledScoreHelp>Very easy</StyledScoreHelp>
        </StyledScoreInput>
    );
};
