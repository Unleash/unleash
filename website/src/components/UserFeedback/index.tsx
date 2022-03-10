import React from 'react';
import styles from './styles.module.css';
import CloseIcon from '@site/src/icons/close';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const join = (...cs: string[]) => cs.join(' ');

type CustomerType = 'open source' | 'paying';

type FormData = {
    score: number;
    comment: undefined | string;
    customerType: undefined | CustomerType;
};

type InitialData = {
    currentStep: number;
    data: {
        score: undefined | number;
        comment: undefined | string;
        customerType: undefined | CustomerType;
    };
    closedOrCompleted: boolean;
};

type CompleteData = InitialData & {
    initialized: number;
};

const clearedData: InitialData = {
    currentStep: 1,
    data: {
        score: undefined,
        comment: undefined,
        customerType: undefined,
    },
    closedOrCompleted: false,
};

const localstorageKey = 'user-feedback-v1';
const populateData = (initialData: InitialData): CompleteData => {
    // if we get seed data, use that. Otherwise, check if the last entry in
    // localstorage was completed. If not, use that as base.

    const getSeedData = () => {
        if (initialData) {
            return initialData;
        }

        const userFeedbackLog = getUserDataRecord();

        if (userFeedbackLog) {
            const mostRecentTimestamp = Math.max(
                ...Object.keys(userFeedbackLog).map(parseInt),
            );
            const mostRecent = userFeedbackLog[mostRecentTimestamp];
            if (mostRecent && !mostRecent.closedOrCompleted) {
                return mostRecent;
            }
        }

        return {};
    };

    const seedData = getSeedData();

    return {
        currentStep: 1,
        ...seedData,
        data: {
            score: undefined,
            comment: undefined,
            customerType: undefined,
            ...seedData?.data,
        },
        initialized: Date.now(),
    };
};

const getUserDataRecord = () =>
    JSON.parse(localStorage.getItem(localstorageKey));

const storeData = (data: CompleteData) => {
    const existingData = getUserDataRecord();
    localStorage.setItem(
        localstorageKey,
        JSON.stringify({
            ...existingData,
            [data.initialized]: data,
        }),
    );
};

type Message =
    | { kind: 'close' }
    | { kind: 'completed' }
    | { kind: 'reset' }
    | { kind: 'set score'; data: number }
    | { kind: 'set comment'; data: string }
    | { kind: 'set customer type'; data: CustomerType }
    | { kind: 'step forward' }
    | { kind: 'step back' };

const stateReducer = (state: CompleteData, message: Message) => {
    switch (message.kind) {
        case 'close':
            return { ...state, closedOrCompleted: true };
        case 'completed':
            return { ...state, closedOrCompleted: true };
        case 'reset':
            return { ...populateData(clearedData), closedOrCompleted: false };
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
                currentStep: Math.min(state.currentStep + 1, 4),
            };
        case 'step back':
            return {
                ...state,
                currentStep: Math.max(state.currentStep - 1, 1),
            };
    }
};

type Props = {
    seedData?: InitialData;
    open?: boolean;
};

export const FeedbackWrapper: React.FC<Props> = ({ seedData, open }) => {
    const {
        siteConfig: { customFields },
    } = useDocusaurusContext();

    const feedbackTargetUrl: string | undefined =
        (customFields?.unleashFeedbackTargetUrl as string | undefined) ??
        (typeof process !== 'undefined' &&
            process?.env?.UNLEASH_FEEDBACK_TARGET_URL);

    const [feedbackIsOpen, setFeedbackIsOpen] = React.useState(open);
    const [manuallyOpened, setManuallyOpened] = React.useState(open);

    const [state, dispatch] = React.useReducer(
        stateReducer,
        seedData,
        populateData,
    );

    const close = () => dispatch({ kind: 'close' });
    if (feedbackIsOpen) {
        storeData(state);
    }

    const stepForward = () => {
        dispatch({ kind: 'step forward' });
    };
    const stepBack = () => {
        dispatch({ kind: 'step back' });
    };
    const setScore = (score: number) =>
        dispatch({ kind: 'set score', data: score });
    const setComment = (comment: string) =>
        dispatch({ kind: 'set comment', data: comment });
    const setCustomerType = (customerType: CustomerType) =>
        dispatch({ kind: 'set customer type', data: customerType });

    const submitFeedback = (data: FormData) => {
        if (feedbackTargetUrl) {
            fetch(feedbackTargetUrl, {
                method: 'post',
                body: JSON.stringify({
                    data: {
                        ...data,
                        openedManually: manuallyOpened,
                        currentPage: location.pathname,
                    },
                }),
                headers: {
                    'content-type': 'application/json',
                },
            })
                .then(async (res) =>
                    res.ok
                        ? console.log('Success! Feedback was registered.')
                        : console.warn(
                              `Oh, no! The feedback registration failed: ${await res.text()}`,
                          ),
                )
                .catch((e) =>
                    console.error(
                        'Oh, no! The feedback registration failed:',
                        e,
                    ),
                );
        } else {
            console.warn(
                'No target url specified for feedback. Not doing anything.',
            );
        }
        dispatch({ kind: 'completed' });
        stepForward();
    };

    const visuallyHidden = (stepNumber: number) =>
        state.currentStep !== stepNumber;
    const isHidden = (stepNumber: number) =>
        !feedbackIsOpen || visuallyHidden(stepNumber);

    const Step1 = () => {
        const hidden = isHidden(1);
        const [newValue, setNewValue] = React.useState(state.data.score);
        return (
            <form
                className={visuallyHidden(1) ? styles['invisible'] : ''}
                onSubmit={(e) => {
                    e.preventDefault();
                    setScore(newValue);
                    stepForward();
                }}
                aria-hidden={hidden}
            >
                <fieldset disabled={hidden}>
                    <p>
                        <span className="visually-hidden">
                            On a scale from 1 to 5 where 1 is very unsatisfied
                            and 5 is very satisfied,
                        </span>{' '}
                        How would you rate your overall satisfaction with the
                        Unleash documentation?
                    </p>

                    <div className={styles['satisfaction-input-container']}>
                        <span
                            aria-hidden="true"
                            className={
                                styles['satisfaction-input-visual-label']
                            }
                        >
                            Very unsatisfied
                        </span>
                        <span className={styles['satisfaction-input-inputs']}>
                            {[1, 2, 3, 4, 5].map((n, i) => (
                                <span key={`input-group-${n}`}>
                                    <input
                                        className={join(
                                            'visually-hidden',
                                            styles[
                                                'user-satisfaction-score-input'
                                            ],
                                        )}
                                        required
                                        id={`user-satisfaction-score-${n}`}
                                        name="satisfaction-level"
                                        type="radio"
                                        value={n}
                                        defaultChecked={n === state.data.score}
                                        onChange={(e) => {
                                            const value = parseInt(
                                                e.target.value,
                                            );
                                            setNewValue(value);
                                        }}
                                        autoFocus={
                                            manuallyOpened
                                                ? state.data.score
                                                    ? state.data.score === n
                                                    : i === 0
                                                : false
                                        }
                                    />
                                    <label
                                        className={
                                            styles[
                                                'user-satisfaction-score-label'
                                            ]
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
                            className={
                                styles['satisfaction-input-visual-label']
                            }
                        >
                            Very satisfied
                        </span>
                    </div>
                    <div className={styles['button-container']}>
                        <button type="submit">Next</button>
                    </div>
                </fieldset>
            </form>
        );
    };

    const Step2 = () => {
        const hidden = isHidden(2);
        const textareaId = 'feedback-comment-input';
        const saveComment = () =>
            setComment(
                (document.getElementById(textareaId) as HTMLTextAreaElement)
                    .value,
            );

        return (
            <form
                className={visuallyHidden(2) ? styles['invisible'] : ''}
                aria-hidden={hidden}
                onSubmit={(e) => {
                    e.preventDefault();
                    saveComment();
                    stepForward();
                }}
            >
                <fieldset disabled={hidden}>
                    <label htmlFor={textareaId}>
                        What would you like to see improved in the Unleash
                        documentation?
                    </label>
                    <textarea
                        id={textareaId}
                        name=""
                        rows={3}
                        autoFocus
                        defaultValue={state.data.comment}
                    ></textarea>

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
                </fieldset>
            </form>
        );
    };

    const Step3 = () => {
        const hidden = isHidden(3);
        const [value, setValue] = React.useState<CustomerType | undefined>(
            state.data.customerType,
        );

        return (
            <form
                className={visuallyHidden(3) ? styles['invisible'] : ''}
                aria-hidden={hidden}
                onSubmit={(e) => {
                    e.preventDefault();
                    setCustomerType(value);

                    // To ensure that we get the correct customer type included.
                    // We can't rely on the reducer to set it because it won't
                    // happen until the component re-renders, causing customer
                    // type to have an old or empty value.
                    const finalState = stateReducer(state, {
                        kind: 'set customer type',
                        data: value,
                    });
                    submitFeedback(finalState.data);
                }}
            >
                <fieldset disabled={hidden}>
                    <span>
                        Finally, are you a paying customer or an open source
                        customer of Unleash?
                    </span>
                    <div className={styles['customer-type-inputs']}>
                        {[
                            ['a', 'paying', 'paying'],
                            ['an', 'open source', 'opensource'],
                        ].map(([article, customerType, key], i) => (
                            <span key={`input-group-${key}`}>
                                <input
                                    autoFocus={
                                        state.data.customerType
                                            ? state.data.customerType === key
                                            : i === 0
                                    }
                                    id={`customer-type-${key}`}
                                    className={styles['customer-type-input']}
                                    name="customer-type"
                                    type="radio"
                                    value={key}
                                    defaultChecked={
                                        customerType === state.data.customerType
                                    }
                                    onChange={() => {
                                        setValue(customerType as CustomerType);
                                    }}
                                />
                                <label
                                    className={styles['customer-type-label']}
                                    htmlFor={`customer-type-${key}`}
                                >
                                    {`I'm ${article} ${customerType} customer`}
                                </label>
                            </span>
                        ))}
                    </div>

                    <div className={styles['button-container']}>
                        <button type="submit">Submit</button>
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
                </fieldset>
            </form>
        );
    };

    const Step4 = () => {
        const hidden = isHidden(4);
        return (
            <div className={visuallyHidden(4) ? styles['invisible'] : ''}>
                <p className={styles['thank-you']}>Thank you! 🙌</p>
                <button
                    className={styles['button-secondary']}
                    disabled={hidden}
                    onClick={() => {
                        setFeedbackIsOpen(false);
                        close();
                    }}
                    autoFocus
                >
                    close
                </button>
            </div>
        );
    };

    return (
        <div className={styles['user-feedback-container']}>
            <button
                aria-hidden={feedbackIsOpen}
                className={join(
                    styles['open-feedback-button'],
                    styles['primary-button'],
                )}
                disabled={feedbackIsOpen}
                onClick={() => {
                    setFeedbackIsOpen(true);
                    setManuallyOpened(true);
                    if (state.closedOrCompleted) {
                        dispatch({ kind: 'reset' });
                    }
                }}
            >
                <span>Feedback</span>
            </button>

            <article
                aria-hidden={!feedbackIsOpen}
                className={join(
                    styles['user-feedback'],
                    feedbackIsOpen ? '' : styles['invisible'],
                )}
            >
                <div className={styles['close-button-row']}>
                    <button
                        onClick={() => {
                            setFeedbackIsOpen(false);
                            close();
                        }}
                        className={styles['close-button']}
                        disabled={!feedbackIsOpen}
                    >
                        <span className="visually-hidden">
                            close feedback popup
                        </span>
                        <CloseIcon />
                    </button>
                </div>
                <div className={styles['form-section-container']}>
                    <Step1 />
                    <Step2 />
                    <Step3 />
                    <Step4 />
                </div>
            </article>
        </div>
    );
};

export default FeedbackWrapper;
