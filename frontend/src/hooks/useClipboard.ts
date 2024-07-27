import { useCallback, useEffect, useState } from 'react';
import {usePermission} from "@/hooks/usePermission.ts";

export const isPermissionAllowed = (status: PermissionState) =>
    status === 'granted' || status === 'prompt';

export const legacyCopyToClipboard = (value: string) => {
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = value;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
};

export interface UseCopyToClipboardReturn {
    value: string | null;
    copy: (value: string) => Promise<void>;
    supported: boolean;
}

export interface UseCopyToClipboardParams {
    enabled: boolean;
}


export const useClipboard = (params?: UseCopyToClipboardParams): UseCopyToClipboardReturn => {
    const supported = navigator && 'clipboard' in navigator;

    const [value, setValue] = useState<string | null>(null);
    const clipboardReadPermission = usePermission('clipboard-read');
    const clipboardWritePermissionWrite = usePermission('clipboard-write');

    const enabled = params?.enabled ?? false;

    const set = async () => {
        try {
            if (supported && isPermissionAllowed(clipboardReadPermission.state)) {
                const value = await navigator.clipboard.readText();
                setValue(value);
            } else setValue(document?.getSelection?.()?.toString() ?? '');
        } catch {
            setValue(document?.getSelection?.()?.toString() ?? '');
        }
    };

    useEffect(() => {
        if (!enabled) return;

        document.addEventListener('copy', set);
        document.addEventListener('cut', set);
        return () => {
            document.removeEventListener('copy', set);
            document.removeEventListener('cut', set);
        };
    }, [enabled]);

    const copy = useCallback(async (value: string) => {
        try {
            if (supported || isPermissionAllowed(clipboardWritePermissionWrite.state)) {
                await navigator.clipboard.writeText(value);
            } else {
                legacyCopyToClipboard(value);
            }
        } catch {
            legacyCopyToClipboard(value);
        }

        setValue(value);
    }, []);

    return { supported, value, copy };
};