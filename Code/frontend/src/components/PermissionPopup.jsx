import React, { useEffect } from 'react';
import '../css/PermissionPopup.css';

const PermissionPopup = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Disappear after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="permission-popup">
            {message}
        </div>
    );
};

export default PermissionPopup;
