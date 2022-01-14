import SimpleAuth from '../SimpleAuth/SimpleAuth';
import AuthenticationCustomComponent from '../authentication-custom-component';
import PasswordAuth from '../PasswordAuth/PasswordAuth';
import HostedAuth from '../HostedAuth/HostedAuth';
import DemoAuth from '../DemoAuth';

import {
    SIMPLE_TYPE,
    DEMO_TYPE,
    PASSWORD_TYPE,
    HOSTED_TYPE,
} from '../../../constants/authTypes';
import SecondaryLoginActions from '../common/SecondaryLoginActions/SecondaryLoginActions';
import useUser from '../../../hooks/api/getters/useUser/useUser';
import { IUser } from '../../../interfaces/user';
import { useHistory } from 'react-router';
import useQueryParams from '../../../hooks/useQueryParams';
import ConditionallyRender from '../../common/ConditionallyRender';
import { Alert } from '@material-ui/lab';

interface IAuthenticationProps {
    insecureLogin: (path: string, user: IUser) => void;
    passwordLogin: (path: string, user: IUser) => void;
    demoLogin: (path: string, user: IUser) => void;
    history: any;
}

const Authentication = ({
    insecureLogin,
    passwordLogin,
    demoLogin,
}: IAuthenticationProps) => {
    const { authDetails } = useUser();
    const history = useHistory();
    const params = useQueryParams();

    const error = params.get('errorMsg');
    if (!authDetails) return null;

    let content;
    if (authDetails.type === PASSWORD_TYPE) {
        content = (
            <>
                <PasswordAuth
                    passwordLogin={passwordLogin}
                    authDetails={authDetails}
                    history={history}
                />
                <ConditionallyRender
                    condition={!authDetails.disableDefault}
                    show={<SecondaryLoginActions />}
                />
            </>
        );
    } else if (authDetails.type === SIMPLE_TYPE) {
        content = (
            <SimpleAuth
                insecureLogin={insecureLogin}
                authDetails={authDetails}
                history={history}
            />
        );
    } else if (authDetails.type === DEMO_TYPE) {
        content = (
            <DemoAuth
                demoLogin={demoLogin}
                authDetails={authDetails}
                history={history}
            />
        );
    } else if (authDetails.type === HOSTED_TYPE) {
        content = (
            <>
                <HostedAuth
                    passwordLogin={passwordLogin}
                    authDetails={authDetails}
                    history={history}
                />
                <ConditionallyRender
                    condition={!authDetails.disableDefault}
                    show={<SecondaryLoginActions />}
                />
            </>
        );
    } else {
        content = <AuthenticationCustomComponent authDetails={authDetails} />;
    }
    return (
        <>
            <div style={{ maxWidth: '350px' }}>
                <ConditionallyRender
                    condition={Boolean(error)}
                    show={<Alert severity="error">{error}</Alert>}
                />
            </div>
            {content}
        </>
    );
};

export default Authentication;
