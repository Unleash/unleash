import {
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from 'react-router-dom';
import { ITab, VerticalTabs } from 'component/common/VerticalTabs/VerticalTabs';
import { ProjectAccess } from 'component/project/ProjectAccess/ProjectAccess';
import ProjectEnvironmentList from 'component/project/ProjectEnvironment/ProjectEnvironment';
import { ChangeRequestConfiguration } from './ChangeRequestConfiguration/ChangeRequestConfiguration';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import { ProFeatureTooltip } from '../../../common/ProFeatureTooltip/ProFeatureTooltip';
import { Link, styled } from '@mui/material';

const StyledLink = styled(Link)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    width: 'fit-content',
}));

export const ProjectSettings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isOss, uiConfig } = useUiConfig();
    const isPro = !(
        Boolean(uiConfig.versionInfo?.current.oss) ||
        Boolean(uiConfig.versionInfo?.current.enterprise)
    );

    const tabs: ITab[] = [
        {
            id: 'access',
            label: 'Access',
            disabled: isOss(),
            tooltipProps: {
                titleComponent: (
                    <ProFeatureTooltip
                        title={'Pro & Enterprise feature'}
                        origin={'Project Access'}
                    >
                        <>
                            If you want to control{' '}
                            <StyledLink
                                href={
                                    'https://docs.getunleash.io/how-to/users-and-permissions'
                                }
                                target="_blank"
                            >
                                "Access"
                            </StyledLink>{' '}
                            you will need to upgrade to Enterprise plan
                        </>
                    </ProFeatureTooltip>
                ),
                sx: { maxWidth: '320px' },
                variant: 'custom',
            },
        },
        {
            id: 'environments',
            label: 'Environments',
            disabled: false,
        },
        {
            id: 'change-requests',
            label: 'Change request configuration',
            disabled: isOss() || isPro,
            tooltipProps: {
                titleComponent: (
                    <ProFeatureTooltip
                        title={'Enterprise feature'}
                        origin={'Project Change Request Configuration'}
                    >
                        <>
                            If you want to use{' '}
                            <StyledLink
                                href={'https://www.getunleash.io/plans'} // TODO: Add link to change request docs when available
                                target="_blank"
                            >
                                "Change Requests"
                            </StyledLink>{' '}
                            you will need to upgrade to Enterprise plan
                        </>
                    </ProFeatureTooltip>
                ),
                sx: { maxWidth: '320px' },
                variant: 'custom',
            },
        },
    ];

    const onChange = (tab: ITab) => {
        navigate(tab.id);
    };

    return (
        <VerticalTabs
            tabs={tabs}
            value={
                tabs.find(
                    ({ id }) => id && location.pathname?.includes(`/${id}`)
                )?.id || tabs[0].id
            }
            onChange={onChange}
        >
            <Routes>
                <Route path={`${tabs[0].id}/*`} element={<ProjectAccess />} />
                <Route
                    path={`${tabs[1].id}/*`}
                    element={<ProjectEnvironmentList />}
                />
                <Route
                    path={`${tabs[2].id}/*`}
                    element={<ChangeRequestConfiguration />}
                />
                <Route
                    path="*"
                    element={<Navigate replace to={tabs[0].id} />}
                />
            </Routes>
        </VerticalTabs>
    );
};
