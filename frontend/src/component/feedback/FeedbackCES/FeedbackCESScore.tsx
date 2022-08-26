import React from 'react';
import produce from 'immer';
import { useStyles } from 'component/feedback/FeedbackCES/FeedbackCESScore.styles';
import { IFeedbackCESForm } from 'component/feedback/FeedbackCES/FeedbackCESForm';

interface IFeedbackCESScoreProps {
    form: Partial<IFeedbackCESForm>;
    setForm: React.Dispatch<React.SetStateAction<Partial<IFeedbackCESForm>>>;
}

export const FeedbackCESScore = ({ form, setForm }: IFeedbackCESScoreProps) => {
    const { classes: styles } = useStyles();

    const onScoreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm(
            produce(draft => {
                draft.score = Number(event.target.value);
            })
        );
    };

    return (
        <div className={styles.scoreInput}>
            <span className={styles.scoreHelp}>Very difficult</span>
            {[1, 2, 3, 4, 5, 6, 7].map(score => (
                <label key={score} className={styles.scoreValue}>
                    <input
                        type="radio"
                        name="score"
                        value={score}
                        checked={form.score === score}
                        onChange={onScoreChange}
                    />
                    <span>{score}</span>
                </label>
            ))}
            <span className={styles.scoreHelp}>Very easy</span>
        </div>
    );
};
