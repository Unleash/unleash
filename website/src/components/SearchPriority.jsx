// src/components/SearchPriority.js
import React from 'react';
import Head from '@docusaurus/Head';

// Define the mapping from level names to numbers
const priorityMap = {
    low: 1,
    medium: 2,
    high: 3,
};

export default function SearchPriority({ level }) {
    // If no level is provided, render nothing.
    if (!level) {
        return null;
    }

    // If level is 'noindex', render the robots tag.
    if (level === 'noindex') {
        return (
            <Head>
                <meta name='robots' content='noindex' />
            </Head>
        );
    }

    // If a valid level was found, render the priority tag
    const priorityValue = priorityMap[level];

    return priorityValue ? (
        <Head>
            <meta name='search_priority' content={priorityValue} />
        </Head>
    ) : null;
}
