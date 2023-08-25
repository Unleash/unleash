import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from '../../../hooks/api/getters/useUiConfig/useUiConfig';
import { ApplicationList } from './ApplicationList';
import { OldApplicationList } from './OldApplicationList';

export const TemporaryApplicationListWrapper = () => {
    const { uiConfig } = useUiConfig();

    return (
        <ConditionallyRender
            condition={Boolean(uiConfig.flags.newApplicationList)}
            show={<ApplicationList />}
            elseShow={<OldApplicationList />}
        />
    );
};
