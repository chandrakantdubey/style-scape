import { useState, useCallback } from 'react';

export function useCopyToClipboard(): [boolean, (text: string) => void] {
    const [isCopied, setIsCopied] = useState(false);

    const copy = useCallback((text: string) => {
        if (!navigator.clipboard) {
            console.warn('Clipboard not supported');
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        }, (err) => {
            console.error('Failed to copy: ', err);
        });
    }, []);

    return [isCopied, copy];
}
