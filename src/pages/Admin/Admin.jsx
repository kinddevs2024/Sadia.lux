import React from 'react';
import { Analytics } from '@vercel/analytics/react';

const Admin = () => {
    return (
        <div>
            <h1>Admin Page</h1>
            <Analytics />
        </div>
    );
};

export default Admin;