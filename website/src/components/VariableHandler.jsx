import React from 'react';
import { useUserData } from '@site/src/theme/Root';

function VariableInput({ variables = [] }) {
    const { userData, setUserData } = useUserData();
    return (
        Boolean(variables.length) && (
            <details className="var-details">
                <summary>User variables</summary>
                {variables.map((v) => (
                    <label key={v.name} className="var-label">
                        {v.name}
                        <p>{v.description}</p>
                        <div>
                            <input
                                onChange={(e) =>
                                    setUserData({
                                        ...userData,
                                        [v.name]: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </label>
                ))}
            </details>
        )
    );
}

export default VariableInput;
