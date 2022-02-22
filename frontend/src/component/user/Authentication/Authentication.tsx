import SimpleAuth from '../SimpleAuth/SimpleAuth';
import AuthenticationCustomComponent from '../authentication-custom-component';
import PasswordAuth from '../PasswordAuth/PasswordAuth';
import HostedAuth from '../HostedAuth/HostedAuth';
import DemoAuth from '../DemoAuth/DemoAuth';
import {
    SIMPLE_TYPE,
    DEMO_TYPE,
    PASSWORD_TYPE,
    HOSTED_TYPE,
} from '../../../constants/authTypes';
import SecondaryLoginActions from '../common/SecondaryLoginActions/SecondaryLoginActions';
import useQueryParams from '../../../hooks/useQueryParams';
import ConditionallyRender from '../../common/ConditionallyRender';
import { Alert } from '@material-ui/lab';
import { useAuthDetails } from '../../../hooks/api/getters/useAuth/useAuthDetails';

interface IAuthenticationProps {
    redirect: string;
}
const Authentication = ({ redirect }: IAuthenticationProps) => {
    const { authDetails } = useAuthDetails();
    const params = useQueryParams();

    const error = params.get('errorMsg');
    if (!authDetails) return null;

    let content;
    if (authDetails.type === PASSWORD_TYPE) {
        content = (
            <>
                <PasswordAuth authDetails={authDetails} redirect={redirect} />
                <ConditionallyRender
                    condition={!authDetails.defaultHidden}
                    show={<SecondaryLoginActions />}
                />
            </>
        );
    } else if (authDetails.type === SIMPLE_TYPE) {
        content = <SimpleAuth authDetails={authDetails} redirect={redirect} />;
    } else if (authDetails.type === DEMO_TYPE) {
        content = <DemoAuth authDetails={authDetails} redirect={redirect} />;
    } else if (authDetails.type === HOSTED_TYPE) {
        content = (
            <>
                <HostedAuth authDetails={authDetails} redirect={redirect} />
                <ConditionallyRender
                    condition={!authDetails.defaultHidden}
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
