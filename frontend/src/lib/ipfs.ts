import axios from "axios";

const urlFile = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
const urlJson = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
const gateway = `https://gateway.pinata.cloud/ipfs/`;
const gateway2 = `https://rose-defiant-impala-747.mypinata.cloud/`;

export const uploadFileToIPFS = async (file: File): Promise<any> => {
    let data: any = new FormData();
    data.append("file", file);

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
            regions: [
                {
                    id: "FRA1",
                    desiredReplicationCount: 1,
                },
                {
                    id: "NYC1",
                    desiredReplicationCount: 2,
                },
            ],
        },
    });
    data.append("pinataOptions", pinataOptions);

    return axios
        .post(urlFile, data, {
            maxBodyLength: Infinity,
            headers: {
                "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
                pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
            },
        })
        .then(function (response: { data: { IpfsHash: string } }) {
            // console.log(`${gateway}${response.data.IpfsHash}`);
            return {
                success: true,
                pinataURL: `${gateway}${response.data.IpfsHash}`,
            };
        })
        .catch(function (error) {
            console.log(error);
            return {
                success: false,
                message: error.message,
            };
        });
};


export const uploadJsonToIPFS = async (data: object): Promise<any> => {
    try {
        return await axios
            .post(urlJson, data, {
                headers: {
                    'Content-Type': `application/json`,
                    pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
                    pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
                }
            })
            .then(function (response: { data: { IpfsHash: string } }) {
                // console.log(`${gateway}${response.data.IpfsHash}`);
                return {
                    success: true,
                    pinataURL: `${gateway}${response.data.IpfsHash}`,
                };
            })
            .catch(function (error) {
                console.log(error);
                return {
                    success: false,
                    message: error.message,
                };
            });
    } catch (error) {
        console.error('Error saving JSON to IPFS:', error);
        throw new Error('Failed to save JSON to IPFS');
    }
};