import React from 'react';
import { Analytics } from '@vercel/analytics/react';

const Shit = () => {
    return (
        <div>
            <h1>Shit Page</h1>
            <p>This is the Shit page.</p>
            <Analytics />
        </div>
    );
};

export default Shit;