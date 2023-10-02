import { useEffect, useState } from 'react';

export const useIsAppleDevice = () => {
    const [isAppleDevice, setIsAppleDevice] = useState<boolean>();

    useEffect(() => {
        const platform =
            (
                navigator as unknown as {
                    userAgentData: { platform: string };
                }
            )?.userAgentData?.platform ||
            navigator?.platform ||
            'unknown';

        setIsAppleDevice(
            platform.toLowerCase().includes('mac') ||
                platform === 'iPhone' ||
                platform === 'iPad'
        );
    }, []);

    return isAppleDevice;
};
