import React from 'react';

const UserDataContext = React.createContext({});

export const useUserData = () => React.useContext(UserDataContext);

export default function Root({ children }) {
    const [userData, setUserData] = React.useState({});
    const context = React.useMemo(
        () => ({ userData, setUserData }),
        [userData, setUserData],
    );
    return (
        <UserDataContext.Provider value={context}>
            {children}
        </UserDataContext.Provider>
    );
}
