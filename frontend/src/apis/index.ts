import axios from "axios";
import {PROXY} from "@/lib/constants.ts";

export const apiEncrypt = async ({codes}: {
    codes: string[]
}) => {
    try {
        const {data} = await axios.post(`${PROXY}${import.meta.env.VITE_SERVER}encrypt`, {codes});
        return data.encryptedCodes
    } catch (error) {
        console.error('Encryption failed:', error);
    }
};

export const apiDecrypt = async ({
                                     voucherId,
                                     message,
                                     signature,
                                     address,
                                 }: {
    message: string,
    signature: string,
    voucherId: number,
    address: string,
}) => {
    const {data} = await axios.post(`${PROXY}${import.meta.env.VITE_SERVER}decrypt`, {
        message,
        signature,
        voucherId,
        address
    });
    return data.decryptedCode
};