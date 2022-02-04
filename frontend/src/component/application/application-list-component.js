import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { CircularProgress } from '@material-ui/core';
import { Warning } from '@material-ui/icons';

import { AppsLinkList, styles as commonStyles } from '../common';
import SearchField from '../common/SearchField/SearchField';
import PageContent from '../common/PageContent/PageContent';
import HeaderTitle from '../common/HeaderTitle';

const Empty = () => (
    <React.Fragment>
        <section style={{ textAlign: 'center' }}>
            <Warning /> <br />
            <br />
            Oh snap, it does not seem like you have connected any applications.
            To connect your application to Unleash you will require a Client
            SDK.
            <br />
            <br />
            You can read more about how to use Unleash in your application in
            the{' '}
            <a href="https://docs.getunleash.io/docs/sdks/">documentation.</a>
        </section>
    </React.Fragment>
);

const ClientStrategies = ({ fetchAll, applications }) => {
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const filteredApplications = useMemo(() => {
        const regExp = new RegExp(filter, 'i');
        return filter
            ? applications?.filter(a => regExp.test(a.appName))
            : applications;
    }, [applications, filter]);

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
                    {filteredApplications.length > 0 ? (
                        <AppsLinkList apps={filteredApplications} />
                    ) : (
                        <Empty />
                    )}
                </div>
            </PageContent>
        </>
    );
};

ClientStrategies.propTypes = {
    applications: PropTypes.array,
    fetchAll: PropTypes.func.isRequired,
};

export default ClientStrategies;
