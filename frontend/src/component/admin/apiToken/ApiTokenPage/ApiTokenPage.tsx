import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import AccessContext from 'contexts/AccessContext';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    CREATE_API_TOKEN,
    READ_API_TOKEN,
} from 'component/providers/AccessProvider/permissions';
import { useStyles } from './ApiTokenPage.styles';
import { CREATE_API_TOKEN_BUTTON } from 'utils/testIds';
import { Alert } from '@mui/material';
import { ApiTokenList } from 'component/admin/apiToken/ApiTokenList/ApiTokenList';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';

export const ApiTokenPage = () => {
    const { classes: styles } = useStyles();
    const { hasAccess } = useContext(AccessContext);
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();

    return (
        <PageContent
            header={
                <PageHeader
                    title="API Access"
                    actions={
                        <ConditionallyRender
                            condition={hasAccess(CREATE_API_TOKEN)}
                            show={
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                        navigate('/admin/api/create-token')
                                    }
                                    data-testid={CREATE_API_TOKEN_BUTTON}
                                >
                                    New API token
                                </Button>
                            }
                        />
                    }
                />
            }
        >
            <Alert severity="info" className={styles.infoBoxContainer}>
                <p>
                    Read the{' '}
                    <a
                        href="https://docs.getunleash.io/docs"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Getting started guide
                    </a>{' '}
                    to learn how to connect to the Unleash API from your
                    application or programmatically. Please note it can take up
                    to 1 minute before a new API key is activated.
                </p>
                <br />
                <strong>API URL: </strong>{' '}
                <pre style={{ display: 'inline' }}>
                    {uiConfig.unleashUrl}/api/
                </pre>
            </Alert>
            <ConditionallyRender
                condition={hasAccess(READ_API_TOKEN)}
                show={() => <ApiTokenList />}
                elseShow={() => <AdminAlert />}
            />
        </PageContent>
    );
};
