import { Suspense } from 'react';
import Loader from 'component/common/Loader/Loader';
import TestSdkConnection from './TestSdkConnection.tsx';
import type { Sdk } from './sharedTypes.ts';
import { SdkConnected } from './SdkConnected.tsx';

interface ISdkConnectionProps {
    sdk: Sdk;
    apiKey: string;
    feature?: string;
    onSdkChange: () => void;
}

export const SdkConnection = ({
    sdk,
    apiKey,
    feature,
    onSdkChange,
}: ISdkConnectionProps) => {
    return (
        <Suspense fallback={<Loader />}>
            {feature ? (
                <TestSdkConnection
                    sdk={sdk}
                    apiKey={apiKey}
                    feature={feature}
                    onSdkChange={onSdkChange}
                />
            ) : (
                <SdkConnected sdk={sdk} />
            )}
        </Suspense>
    );
};
