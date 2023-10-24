declare module 'react-timeago' {
    import React from 'react';

    // Specify the props if necessary. This is just a placeholder.
    interface TimeAgoProps {
        date: Date | string | number;
    }

    // This declaration asserts that the default export from the module is a
    // React component with the specified props.
    const TimeAgo: React.FC<ReactTimeagoProps>;

    // Enable the use of the import syntax
    export default TimeAgo;
}
