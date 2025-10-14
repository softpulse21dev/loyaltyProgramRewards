import React, { useState, useEffect } from 'react';
import { Thumbnail, Spinner } from '@shopify/polaris';
import { NoteIcon } from '@shopify/polaris-icons';

const SvgPreview = ({ file }) => {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only process if it's a File object of type SVG
        if (file instanceof File && file.type === 'image/svg+xml') {
            let isMounted = true;
            const reader = new FileReader();

            reader.onloadend = () => {
                if (isMounted) {
                    setPreview(reader.result); // This will be the data:image/svg+xml;base64,... URL
                    setLoading(false);
                }
            };

            reader.onerror = () => {
                if (isMounted) {
                    setPreview(NoteIcon); // Fallback to a generic icon on error
                    setLoading(false);
                }
            };

            reader.readAsDataURL(file);

            // Cleanup function
            return () => {
                isMounted = false;
            };
        } else {
            setLoading(false);
        }
    }, [file]); // Rerun effect if the file object changes

    if (loading) {
        return <Spinner size="small" />;
    }

    // Use the generated preview or a fallback
    return <Thumbnail size="small" alt={file.name} source={preview || NoteIcon} />;
};

export default SvgPreview;