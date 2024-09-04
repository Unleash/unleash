import { useEffect, useState } from 'react';

const TestRender = () => {
    const [showChild, setShowChild] = useState(false);

    const toggleChildComponent = () => {
        setShowChild((prevShowChild) => !prevShowChild);
    };

    return (
        <div>
            <h1>Test Render</h1>
            <button onClick={toggleChildComponent}>
                {showChild ? 'Hide' : 'Show'} Child Component
            </button>
            {showChild && <ChildComponent />}
        </div>
    );
};

const ChildComponent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 2000); // 2 seconds delay

        return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }, []);

    if (!isVisible) {
        return null; // Render nothing until the timer completes
    }

    return <div>Child component</div>;
};

export default TestRender;
