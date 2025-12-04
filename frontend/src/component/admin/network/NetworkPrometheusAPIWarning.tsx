import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const NetworkPrometheusAPIWarning = () => {
    const {
        uiConfig: { prometheusAPIAvailable },
    } = useUiConfig();

    if (prometheusAPIAvailable) return null;

    return (
        <p>
            This view requires the <strong>PROMETHEUS_API</strong> environment
            variable to be set. Refer to our{' '}
            <a
                href='https://docs.getunleash.io/concepts/network-view#data-source'
                target='_blank'
                rel='noreferrer'
            >
                documentation
            </a>{' '}
            for more information.
        </p>
    );
};
