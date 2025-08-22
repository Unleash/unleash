import React from 'react';
import ApiItemOriginal from '@theme-original/ApiItem';

// Simple wrapper that doesn't break SSR
export default function ApiItem(props: any) {
    return <ApiItemOriginal {...props} />;
}