import React from 'react';
import styles from './styles.module.css';

const Component = ({ text }) => (
    <article className="user-feedback">
        <form className={styles.bah}>
            <p>
                <span className="visually-hidden">
                    On a scale from 1 to 5 where 1 is very unsatisfied and 5 is
                    very satisfied,
                </span>{' '}
                How would you rate your overall satisfaction with the Unleash
                documentation?
            </p>

            <div className="satisfaction-input-container">
                <span aria-hidden="true">Very unsatisfied</span>
                {[1, 2, 3, 4, 5].map((n) => (
                    <span key={`input-group-${n}`}>
                        <input
                            className="visually-hidden user-satisfaction-score-input"
                            required
                            id={`user-satisfaction-score-${n}`}
                            name="satisfaction-level"
                            type="radio"
                            value={n}
                        />
                        <label
                            className="user-satisfaction-score-label"
                            htmlFor={`user-satisfaction-score-${n}`}
                        >
                            {n}
                        </label>
                    </span>
                ))}
                <span aria-hidden="true">Very satisfied</span>
            </div>
            <div className="button-container">
                <button type="submit">Next</button>
            </div>
        </form>
    </article>
);

export default Component;
