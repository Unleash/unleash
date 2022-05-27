import React from 'react';
import { ConfiguredAddons } from './ConfiguredAddons/ConfiguredAddons';
import { AvailableAddons } from './AvailableAddons/AvailableAddons';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useAddons from 'hooks/api/getters/useAddons/useAddons';

export const AddonList = () => {
    const { providers, addons, loading } = useAddons();

    return (
        <>
            <ConditionallyRender
                condition={addons.length > 0}
                show={<ConfiguredAddons />}
            />
            <AvailableAddons loading={loading} providers={providers} />
        </>
    );
};
