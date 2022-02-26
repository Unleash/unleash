import React from 'react';
import styles from './styles.module.css';
import CloseIcon from '@site/src/icons/close';

const join = (...cs) => cs.join(' ');

const Step1 = () => <></>;
const Step2 = () => <></>;
const Step3 = () => <></>;

const initialData = () => ({
    initialized: Date.now(),
    closedOrCompleted: false,
    data: {
        score: undefined,
        comment: undefined,
        customerType: undefined,
    },
});

const fetchData = (initialData) => {
    const localstorageKey = 'user-feedback';

    return initialData;
    // check localstorage
    // populate if there is
};

const FeedbackWrapper = () => {
    const [feedbackIsOpen, setFeedbackIsOpen] = React.useState(false);
    const stateReducer = (state, message) => {
        switch (message.kind) {
            case 'clear':
                return initialData();
            case 'set score':
                return {
                    ...state,
                    data: { ...state.data, score: message.data },
                };
            case 'set comment':
                return {
                    ...state,
                    data: { ...state.data, comment: message.data },
                };
            case 'set customer type':
                return {
                    ...state,
                    data: { ...state.data, customerType: message.data },
                };
        }
        return state;
    };

    const [state, dispatch] = React.useReducer(
        stateReducer,
        initialData(),
        fetchData,
    );

    const clear = () => dispatch({ kind: 'clear' });
    const setScore = (score) => dispatch({ kind: 'set score', data: score });
    const setComment = (comment) =>
        dispatch({ kind: 'set comment', data: comment });
    const setCustomerType = (customerType) =>
        dispatch({ kind: 'set customer type', data: customerType });

    return feedbackIsOpen ? (
        <Component closeFeedback={() => setFeedbackIsOpen(false)} />
    ) : (
        <OpenFeedbackButton openFeedback={() => setFeedbackIsOpen(true)} />
    );
};

const OpenFeedbackButton = ({ openFeedback }) => {
    return <button onClick={openFeedback}>Feedback</button>;
};

const Component = ({ closeFeedback = () => undefined }) => {
    return (
        <article className={styles['user-feedback']}>
            <div className={styles['close-button-row']}>
                <button
                    className={styles['close-button']}
                    onClick={closeFeedback}
                >
                    <span className="visually-hidden">
                        close feedback popup
                    </span>
                    <CloseIcon />
                </button>
            </div>
            <form>
                <p>
                    <span className="visually-hidden">
                        On a scale from 1 to 5 where 1 is very unsatisfied and 5
                        is very satisfied,
                    </span>{' '}
                    How would you rate your overall satisfaction with the
                    Unleash documentation?
                </p>

                <div className={styles['satisfaction-input-container']}>
                    <span aria-hidden="true">Very unsatisfied</span>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <span key={`input-group-${n}`}>
                            <input
                                className={join(
                                    'visually-hidden',
                                    styles['user-satisfaction-score-input'],
                                )}
                                required
                                id={`user-satisfaction-score-${n}`}
                                name="satisfaction-level"
                                type="radio"
                                value={n}
                            />
                            <label
                                className={
                                    styles['user-satisfaction-score-label']
                                }
                                htmlFor={`user-satisfaction-score-${n}`}
                            >
                                {n}
                            </label>
                        </span>
                    ))}
                    <span aria-hidden="true">Very satisfied</span>
                </div>
                <div className={styles['button-container']}>
                    <button className={styles['button-secondary']}>Skip</button>
                    <button type="submit">Next</button>
                </div>
            </form>
        </article>
    );
};

export default Component;
