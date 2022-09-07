import { FC, Dispatch, SetStateAction } from 'react';
import ResetPasswordForm from '../ResetPasswordForm/ResetPasswordForm';

interface IResetPasswordDetails {
    token: string;
    setLoading: Dispatch<SetStateAction<boolean>>;
}

const ResetPasswordDetails: FC<IResetPasswordDetails> = ({
    children,
    token,
    setLoading,
}) => {
    return (
        <div style={{ width: '100%' }}>
            {children}
            <ResetPasswordForm token={token} setLoading={setLoading} />
        </div>
    );
};

export default ResetPasswordDetails;
