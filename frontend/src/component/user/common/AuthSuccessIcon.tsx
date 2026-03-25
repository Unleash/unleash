import passwordSuccess from 'assets/img/passwordSuccess.png';
import { formatAssetPath } from 'utils/formatPath';

export const AuthSuccessIcon = () => (
    <img src={formatAssetPath(passwordSuccess)} alt='' width={56} height={56} />
);
