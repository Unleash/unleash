import React from 'react';
import styles from './styles.module.css';

const svg = () => (
    <svg
        className={styles['icon']}
        viewBox="0 0 12 12"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="m6 5.293 4.789-4.79.707.708-4.79 4.79 4.79 4.789-.707.707-4.79-4.79-4.789 4.79-.707-.707L5.293 6 .502 1.211 1.21.504 6 5.294z" />
    </svg>
);

const Icon = svg;

export default Icon;
