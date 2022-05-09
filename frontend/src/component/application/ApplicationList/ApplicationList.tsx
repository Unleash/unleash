import { useMemo, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { AppsLinkList, styles as themeStyles } from 'component/common';
import { SearchField } from 'component/common/SearchField/SearchField';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import useApplications from 'hooks/api/getters/useApplications/useApplications';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

export const ApplicationList = () => {
    const { applications, loading } = useApplications();
    const [filter, setFilter] = useState('');

    const filteredApplications = useMemo(() => {
        const regExp = new RegExp(filter, 'i');
        return filter
            ? applications?.filter(a => regExp.test(a.appName))
            : applications;
    }, [applications, filter]);

    const renderNoApplications = () => (
        <>
            <section style={{ textAlign: 'center' }}>
                <Warning titleAccess="Warning" /> <br />
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
            <div className={themeStyles.searchField}>
                <SearchField initialValue={filter} updateValue={setFilter} />
            </div>
            <PageContent header={<PageHeader title="Applications" />}>
                <div className={themeStyles.fullwidth}>
                    <ConditionallyRender
                        condition={filteredApplications.length > 0}
                        show={<AppsLinkList apps={filteredApplications} />}
                        elseShow={
                            <ConditionallyRender
                                condition={loading}
                                show={<div>...loading</div>}
                                elseShow={renderNoApplications()}
                            />
                        }
                    />
                </div>
            </PageContent>
        </>
    );
};
