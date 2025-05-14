import type { FC } from 'react';
import { Dialogue } from '../Dialogue/Dialogue.tsx';
import { styled } from '@mui/material';
import { Link } from 'react-router-dom';

interface IFeatureArchiveNotAllowedDialogProps {
    isOpen: boolean;
    onClose: () => void;
    features: string[];
    project: string;
}

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    color: theme.palette.primary.main,
    fontWeight: theme.fontWeight.bold,
}));
export const FeatureArchiveNotAllowedDialog: FC<
    IFeatureArchiveNotAllowedDialogProps
> = ({ isOpen, onClose, features, project }) => {
    return (
        <Dialogue
            title="You can't archive a feature that other features depend on"
            open={isOpen}
            primaryButtonText='OK'
            onClick={onClose}
        >
            <p>The following features depend on your feature:</p>
            <ul>
                {features.map((feature) => (
                    <li key={feature}>
                        <StyledLink
                            to={`/projects/${project}/features/${feature}`}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            {feature}
                        </StyledLink>
                    </li>
                ))}
            </ul>
        </Dialogue>
    );
};
