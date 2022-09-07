import { useEffect, useMemo, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { AppsLinkList, styles as themeStyles } from 'component/common';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import useApplications from 'hooks/api/getters/useApplications/useApplications';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'component/common/Search/Search';

type PageQueryType = Partial<Record<'search', string>>;

export const ApplicationList = () => {
    const { applications, loading } = useApplications();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || ''
    );

    useEffect(() => {
        const tableState: PageQueryType = {};
        if (searchValue) {
            tableState.search = searchValue;
        }

        setSearchParams(tableState, {
            replace: true,
        });
    }, [searchValue, setSearchParams]);

    const filteredApplications = useMemo(() => {
        const regExp = new RegExp(searchValue, 'i');
        return searchValue
            ? applications?.filter(a => regExp.test(a.appName))
            : applications;
    }, [applications, searchValue]);

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

    let applicationCount =
        filteredApplications.length < applications.length
            ? `${filteredApplications.length} of ${applications.length}`
            : applications.length;

    return (
        <>
            <PageContent
                header={
                    <PageHeader
                        title={`Applications (${applicationCount})`}
                        actions={
                            <Search
                                initialValue={searchValue}
                                onChange={setSearchValue}
                            />
                        }
                    />
                }
            >
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
