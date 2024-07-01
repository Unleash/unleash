import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const useUserType = () => {
    const { isPro, isOss, isEnterprise } = useUiConfig();

    if (isPro()) {
        return 'pro';
    }

    if (isOss()) {
        return 'oss';
    }

    if (isEnterprise()) {
        return 'enterprise';
    }

    return 'unknown';
};

export default useUserType;
