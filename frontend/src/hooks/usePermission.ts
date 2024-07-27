import {useEffect, useState} from 'react';
import {useEvent} from "@/hooks/useEvent.ts";

export type UsePermissionName =
    | PermissionName
    | 'accelerometer'
    | 'accessibility-events'
    | 'ambient-light-sensor'
    | 'background-sync'
    | 'camera'
    | 'clipboard-read'
    | 'clipboard-write'
    | 'gyroscope'
    | 'magnetometer'
    | 'microphone'
    | 'notifications'
    | 'payment-handler'
    | 'persistent-storage'
    | 'push'
    | 'speaker';

export interface UsePermissionReturn {
    state: PermissionState;
    supported: boolean;
    query: () => Promise<PermissionState>;
}

export const usePermission = (permissionDescriptorName: UsePermissionName) => {
    const [state, setState] = useState<PermissionState>('prompt');
    const supported = navigator && 'permissions' in navigator;

    const permissionDescriptor = {name: permissionDescriptorName};

    const query = useEvent(async () => {
        try {
            const permissionStatus = await navigator.permissions.query(
                permissionDescriptor as PermissionDescriptor
            );
            setState(permissionStatus.state);
            return permissionStatus.state;
        } catch (error) {
            setState('prompt');
            return 'prompt';
        }
    });

    useEffect(() => {
        if (!supported) return;
        query();
        window.addEventListener('change', query);
        return () => {
            window.removeEventListener('change', query);
        };
    }, [permissionDescriptorName]);

    return {
        state,
        supported,
        query
    };
};