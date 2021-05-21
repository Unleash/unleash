import { Button } from '@material-ui/core';
import classnames from 'classnames';
import { useCommonStyles } from '../../../../common.styles';
import { IAuthOptions } from '../../../../interfaces/user';
import { ReactComponent as GoogleSvg } from '../../../../assets/icons/google.svg';
import LockRounded from '@material-ui/icons/LockRounded';
import ConditionallyRender from '../../../common/ConditionallyRender';

interface IAuthOptionProps {
    options?: IAuthOptions[];
}

const AuthOptions = ({ options }: IAuthOptionProps) => {
    const commonStyles = useCommonStyles();
    return (
        <>
            {options?.map(o => (
                <div
                    key={o.type}
                    className={classnames(
                        commonStyles.flexColumn,
                        commonStyles.contentSpacingY
                    )}
                >
                    <Button
                        color="primary"
                        data-loading
                        variant="outlined"
                        href={o.path}
                        size="small"
                        style={{ height: '40px', color: '#000' }}
                        startIcon={
                            <ConditionallyRender
                                condition={o.type === 'google'}
                                show={
                                    <GoogleSvg
                                        style={{
                                            height: '35px',
                                            width: '35px',
                                        }}
                                    />
                                }
                                elseShow={
                                    <LockRounded
                                        style={{
                                            height: '25px',
                                            width: '25px',
                                        }}
                                    />
                                }
                            />
                        }
                    >
                        {o.message}
                    </Button>
                </div>
            ))}
        </>
    );
};

export default AuthOptions;
