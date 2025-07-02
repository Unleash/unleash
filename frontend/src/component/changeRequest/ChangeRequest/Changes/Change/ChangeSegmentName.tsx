import type { FC } from 'react';
import { NameWithChangeInfo } from './NameWithChangeInfo/NameWithChangeInfo.tsx';

type ChangeSegmentNameProps = {
    name?: string;
    previousName?: string;
};

export const ChangeSegmentName: FC<ChangeSegmentNameProps> = ({
    name,
    previousName,
}) => <NameWithChangeInfo previousName={previousName} newName={name} />;
