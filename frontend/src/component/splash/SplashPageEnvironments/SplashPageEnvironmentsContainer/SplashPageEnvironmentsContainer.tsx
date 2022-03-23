import React from 'react';

interface ISplashPageEnvironmentsContainerProps {
    title: React.ReactNode;
    topDescription: React.ReactNode;
    image?: React.ReactNode;
    bottomDescription?: React.ReactNode;
}

export const SplashPageEnvironmentsContainer = ({
    title,
    topDescription,
    image,
    bottomDescription,
}: ISplashPageEnvironmentsContainerProps) => {
    return (
        <div>
            {title}
            {topDescription}
            {image}
            {bottomDescription}
        </div>
    );
};
