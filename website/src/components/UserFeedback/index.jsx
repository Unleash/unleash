import React from 'react';
import styles from './styles.module.css';
import CloseIcon from '@site/src/icons/close';

const join = (...cs) => cs.join(' ');

export const initialData = {
    currentStep: 1,
    data: {
        score: undefined,
        comment: undefined,
        customerType: undefined,
    },
};

const fetchData = (initialData) => {
    const localstorageKey = 'user-feedback';

    return {
        currentStep: 1,
        ...initialData,
        data: {
            score: undefined,
            comment: undefined,
            customerType: undefined,
            ...initialData?.data,
        },
        initialized: Date.now(),
        closedOrCompleted: false,
    };
    // check localstorage
    // populate if there is
};

const stateReducer = (state, message) => {
    switch (message.kind) {
        case 'clear':
            return fetchData(seedData);
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
        case 'step forward':
            return {
                ...state,
                currentStep: Math.min(state.currentStep + 1, 3),
            };
        case 'step back':
            return {
                ...state,
                currentStep: Math.max(state.currentStep - 1, 1),
            };
    }
    return state;
};

export const FeedbackWrapper = ({ seedData, open }) => {
    const [feedbackIsOpen, setFeedbackIsOpen] = React.useState(open);

    const [state, dispatch] = React.useReducer(
        stateReducer,
        seedData,
        fetchData,
    );

    console.log(state, state.data);

    const clear = () => dispatch({ kind: 'clear' });
    const stepForward = () => {
        console.log('stepping forward!');
        dispatch({ kind: 'step forward' });
    };
    const stepBack = () => dispatch({ kind: 'step back' });
    const setScore = (score) => dispatch({ kind: 'set score', data: score });
    const setComment = (comment) =>
        dispatch({ kind: 'set comment', data: comment });
    const setCustomerType = (customerType) =>
        dispatch({ kind: 'set customer type', data: customerType });

    const submitFeedback = () => {
        console.log('send feedback here ');
    };

    const Step1 = () => {
        const [newValue, setNewValue] = React.useState(undefined);
        return (
            <form
                className="step-1"
                onSubmit={(e) => {
                    e.preventDefault();
                    setScore(newValue);
                    stepForward();
                }}
            >
                <p>
                    <span className="visually-hidden">
                        On a scale from 1 to 5 where 1 is very unsatisfied and 5
                        is very satisfied,
                    </span>{' '}
                    How would you rate your overall satisfaction with the
                    Unleash documentation?
                </p>

                <div className={styles['satisfaction-input-container']}>
                    <span
                        aria-hidden="true"
                        className={styles['satisfaction-input-visual-label']}
                    >
                        Very unsatisfied
                    </span>
                    <span className={styles['satisfaction-input-inputs']}>
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
                                    defaultChecked={n === state.data.score}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        console.log('the value is', value);
                                        setNewValue(value);
                                    }}
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
                    </span>
                    <span
                        aria-hidden="true"
                        className={styles['satisfaction-input-visual-label']}
                    >
                        Very satisfied
                    </span>
                </div>
                <div className={styles['button-container']}>
                    <button type="submit">Next</button>
                </div>
            </form>
        );
    };

    const Step2 = () => {
        const textareaId = 'feedback-comment-input';
        const saveComment = () =>
            setComment(document.getElementById(textareaId).value);

        return (
            <form
                className="step-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    saveComment();
                    stepForward();
                }}
            >
                <label htmlFor={textareaId}>
                    What would you like to see improved in the Unleash
                    documentation?
                </label>
                <textarea
                    id={textareaId}
                    /* cols="30" */
                    name=""
                    rows="5"
                >
                    {state.data.comment}
                </textarea>

                <div className={styles['button-container']}>
                    <button type="submit">Next</button>
                    <button
                        className={styles['button-secondary']}
                        type="button"
                        onClick={() => {
                            saveComment();
                            stepForward();
                        }}
                    >
                        Skip
                    </button>
                    <button
                        className={styles['button-secondary']}
                        type="button"
                        onClick={() => {
                            saveComment();
                            stepBack();
                        }}
                    >
                        Back
                    </button>
                </div>
            </form>
        );
    };

    const Step3 = () => {
        const [value, setValue] = React.useState();

        return (
            <form
                className="step-3"
                onSubmit={(e) => {
                    e.preventDefault();
                    setCustomerType(value);
                    submitFeedback();
                }}
            >
                <span>
                    Finally, would you mind telling us a little about yourself?
                    What kind of customer are you?
                </span>
                <div className={styles['customer-type-inputs']}>
                    {[
                        ['a', 'paying', 'paying'],
                        ['an', 'open source', 'opensource'],
                    ].map(([article, customerType, key]) => (
                        <span key={`input-group-${key}`}>
                            <input
                                id={`customer-type-${key}`}
                                className={styles['customer-type-input']}
                                name="customer-type"
                                type="radio"
                                value={key}
                                defaultChecked={key === state.data.customerType}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setValue(value);
                                }}
                            />
                            <label
                                className={styles['customer-type-label']}
                                htmlFor={`customer-type-${key}`}
                            >
                                I'm {article} {customerType} customer
                            </label>
                        </span>
                    ))}
                </div>

                <div className={styles['button-container']}>
                    <button type="submit">Submit feedback</button>
                    <button
                        className={styles['button-secondary']}
                        type="button"
                        onClick={() => {
                            setCustomerType(value);
                            stepBack();
                        }}
                    >
                        Back
                    </button>
                </div>
            </form>
        );
    };
    return (
        <div className={styles['user-feedback-container']}>
            <p>feedback is {feedbackIsOpen ? 'open' : 'closed'}</p>
            <button
                className={join(
                    feedbackIsOpen ? styles['hidden'] : undefined,
                    styles['open-feedback-button'],
                    styles['primary-button'],
                )}
                disabled={feedbackIsOpen}
                onClick={() => setFeedbackIsOpen(true)}
            >
                Feedback
            </button>

            <article
                className={join(
                    styles['user-feedback'],
                    feedbackIsOpen ? '' : styles['hidden'],
                )}
            >
                <div className={styles['close-button-row']}>
                    <button
                        onClick={() => setFeedbackIsOpen(false)}
                        className={styles['close-button']}
                    >
                        <span className="visually-hidden">
                            close feedback popup
                        </span>
                        <CloseIcon />
                    </button>
                </div>
                {state.currentStep === 1 ? (
                    <Step1 />
                ) : state.currentStep === 2 ? (
                    <Step2 />
                ) : (
                    <Step3 />
                )}
            </article>
        </div>
    );
};
