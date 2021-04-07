import React from 'react';

function ApiHowTo() {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <p
                style={{
                    backgroundColor: '#cfe5ff',
                    border: '2px solid #c4e1ff',
                    padding: '8px',
                    borderRadius: '5px',
                }}
            >
                Read the{' '}
                <a href="https://www.unleash-hosted.com/docs" target="_blank" rel="noreferrer">
                    Getting started guide
                </a>{' '}
                to learn how to connect to the Unleash API form your application or programmatically. <br /> <br />
                Please note it can take up to 1 minute before a new API key is activated.
            </p>
        </div>
    );
}

export default ApiHowTo;
