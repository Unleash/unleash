import React from 'react';
import UF from '@site/src/components/UserFeedback';

// Default implementation, that you can customize
function Root({ children }) {
    return (
        <>
            <UF />
            {children}
        </>
    );
}

export default Root;
