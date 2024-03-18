import { ConditionallyRender } from '../../common/ConditionallyRender/ConditionallyRender';
import { Banner } from '../Banner/Banner';
import type { IBanner } from 'interfaces/banner';
import { useOutdatedSdks } from 'hooks/api/getters/useOutdatedSdks/useOutdatedSdks';
import { useUiFlag } from 'hooks/useUiFlag';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material';

const StyledList = styled('ul')({ margin: 0 });

export const OutdatedSdksBanner = () => {
    const {
        data: { sdks },
    } = useOutdatedSdks();
    const flagEnabled = useUiFlag('outdatedSdksBanner');

    const outdatedSdksBanner: IBanner = {
        message: `We noticed that you're using outdated SDKs. `,
        variant: 'warning',
        link: 'dialog',
        linkText: 'Please update those versions',
        dialogTitle: 'Outdated SDKs',
        dialog: (
            <>
                {sdks.map((item) => (
                    <div key={item.sdkVersion}>
                        <span>{item.sdkVersion}</span>
                        <StyledList>
                            {item.applications.map((application) => (
                                <li key={application}>
                                    <Link to={`/applications/${application}`}>
                                        {application}
                                    </Link>
                                </li>
                            ))}
                        </StyledList>
                    </div>
                ))}
            </>
        ),
    };
    return (
        <>
            <ConditionallyRender
                condition={flagEnabled && sdks.length > 0}
                show={<Banner banner={outdatedSdksBanner} />}
            />
        </>
    );
};
