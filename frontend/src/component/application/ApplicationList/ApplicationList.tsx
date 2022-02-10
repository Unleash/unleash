import { useMemo, useState } from 'react';
import { CircularProgress } from '@material-ui/core';
import { Warning } from '@material-ui/icons';

import { AppsLinkList, styles as commonStyles } from '../../common';
import SearchField from '../../common/SearchField/SearchField';
import PageContent from '../../common/PageContent/PageContent';
import HeaderTitle from '../../common/HeaderTitle';
import useApplications from '../../../hooks/api/getters/useApplications/useApplications';
import ConditionallyRender from '../../common/ConditionallyRender';

const ApplicationList = () => {
    const { applications, loading } = useApplications();
    const [filter, setFilter] = useState('');

    const filteredApplications = useMemo(() => {
        const regExp = new RegExp(filter, 'i');
        return filter
            ? applications?.filter(a => regExp.test(a.appName))
            : applications;
    }, [applications, filter]);

    const RenderNoApplications = () => (
        <>
            <section style={{ textAlign: 'center' }}>
                <Warning /> <br />
                <br />
                Oh snap, it does not seem like you have connected any
                applications. To connect your application to Unleash you will
                require a Client SDK.
                <br />
                <br />
                You can read more about how to use Unleash in your application
                in the{' '}
                <a href="https://docs.getunleash.io/docs/sdks/">
                    documentation.
                </a>
            </section>
        </>
    );

    if (!filteredApplications) {
        return <CircularProgress variant="indeterminate" />;
    }

    return (
        <>
            <div className={commonStyles.searchField}>
                <SearchField value={filter} updateValue={setFilter} />
            </div>
            <PageContent headerContent={<HeaderTitle title="Applications" />}>
                <div className={commonStyles.fullwidth}>
                    <ConditionallyRender
                        condition={filteredApplications.length > 0}
                        show={<AppsLinkList apps={filteredApplications} />}
                        elseShow={
                            <ConditionallyRender
                                condition={loading}
                                show={<div>...loading</div>}
                                elseShow={<RenderNoApplications />}
                            />
                        }
                    />
                </div>
            </PageContent>
        </>
    );
};

export default ApplicationList;
