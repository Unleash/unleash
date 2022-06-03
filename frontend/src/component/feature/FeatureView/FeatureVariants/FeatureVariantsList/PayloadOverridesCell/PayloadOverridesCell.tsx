import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { IOverride, IPayload } from 'interfaces/featureToggle';

interface IPayloadOverridesCellProps {
    payload: IPayload;
    overrides: IOverride[];
}

export const PayloadOverridesCell = ({
    payload,
    overrides,
}: IPayloadOverridesCellProps) => {
    return (
        <>
            <ConditionallyRender
                condition={Boolean(payload)}
                show={<TextCell>Payload</TextCell>}
            />
            <ConditionallyRender
                condition={overrides && overrides.length > 0}
                show={<TextCell>Overrides</TextCell>}
            />
        </>
    );
};
