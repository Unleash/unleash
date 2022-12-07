import { RadioGroup, FormControl, Typography, Switch } from '@mui/material';
import {
    ButtonContainer,
    CancelButton,
    Container,
    FlexRow,
    Form,
    InputDescription,
    RoleBox,
    RoleRadio,
    RoleSubTitle,
    StyledInput,
} from './UserForm.styles';
import React from 'react';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { EDIT } from 'constants/misc';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface IUserForm {
    email: string;
    name: string;
    rootRole: number;
    sendEmail: boolean;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setSendEmail: React.Dispatch<React.SetStateAction<boolean>>;
    setRootRole: React.Dispatch<React.SetStateAction<number>>;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    clearErrors: () => void;
    mode?: string;
}

const UserForm: React.FC<IUserForm> = ({
    children,
    email,
    name,
    rootRole,
    sendEmail,
    setEmail,
    setName,
    setSendEmail,
    setRootRole,
    handleSubmit,
    handleCancel,
    errors,
    clearErrors,
    mode,
}) => {
    const { roles } = useUsers();
    const { uiConfig } = useUiConfig();

    // @ts-expect-error
    const sortRoles = (a, b) => {
        if (b.name[0] < a.name[0]) {
            return 1;
        } else if (a.name[0] < b.name[0]) {
            return -1;
        }
        return 0;
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Container>
                <InputDescription>
                    Who is the new Unleash user?
                </InputDescription>
                <StyledInput
                    label="Full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => clearErrors()}
                    autoFocus
                />
                <StyledInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    error={Boolean(errors.email)}
                    errorText={errors.email}
                    onFocus={() => clearErrors()}
                />
                <FormControl>
                    <RoleSubTitle variant="subtitle1" data-loading>
                        What is your team member allowed to do?
                    </RoleSubTitle>
                    <RadioGroup
                        name="rootRole"
                        value={rootRole || ''}
                        onChange={e => setRootRole(+e.target.value)}
                        data-loading
                    >
                        {/* @ts-expect-error */}
                        {roles.sort(sortRoles).map(role => (
                            <RoleBox
                                key={`role-${role.id}`}
                                labelPlacement="end"
                                label={
                                    <div>
                                        <strong>{role.name}</strong>
                                        <Typography variant="body2">
                                            {role.description}
                                        </Typography>
                                    </div>
                                }
                                control={
                                    <RoleRadio checked={role.id === rootRole} />
                                }
                                value={role.id}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
                <ConditionallyRender
                    condition={mode !== EDIT && Boolean(uiConfig?.emailEnabled)}
                    show={
                        <FormControl>
                            <RoleSubTitle variant="subtitle1" data-loading>
                                Should we send an email to your new team member
                            </RoleSubTitle>
                            <FlexRow>
                                <Switch
                                    name="sendEmail"
                                    onChange={() => setSendEmail(!sendEmail)}
                                    checked={sendEmail}
                                />
                                <Typography>
                                    {sendEmail ? 'Yes' : 'No'}
                                </Typography>
                            </FlexRow>
                        </FormControl>
                    }
                />
            </Container>
            <ButtonContainer>
                {children}
                <CancelButton onClick={handleCancel}>Cancel</CancelButton>
            </ButtonContainer>
        </Form>
    );
};

export default UserForm;
