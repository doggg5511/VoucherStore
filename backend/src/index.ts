import express from 'express';
import morgan from "morgan";
import helmet from 'helmet';
import cors from 'cors';
import 'dotenv/config'
import CryptoJS from 'crypto-js';
// @ts-ignore
import {verifyMessage} from 'viem';
import {STORE_VOUCHERS, STORE_VOUCHERS_ABI} from "./contracts";
import {jocClientRead} from "./wagmi";
import axios from "axios";

const PORT = process.env.PORT || 5000

const app = express()

app.use(cors())

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
)

app.use(function (req, res, next) {
    res.setHeader('Cross-Origin-Resource-Policy', '*')
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
})

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(morgan('dev'))
app.use(express.urlencoded({extended: true}))

const secretKey = 'my-secret-key-123';

function encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, secretKey).toString();
}

function decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

app.post('/encrypt', async (req, res) => {
    const {codes}: { codes: string[] } = req.body;
    if (!codes || codes.length === 0) {
        return res.status(400).json({error: 'Codes is required'});
    }
    const encryptedCodes = codes.map(code => encrypt(code));
    res.json({encryptedCodes});
});

const getBurnedVouchersIds = async (address: string) => {
    try {
        return await jocClientRead.readContract({
            address: STORE_VOUCHERS as any,
            abi: STORE_VOUCHERS_ABI,
            functionName: 'getBurnedVouchers',
            args: [address]
        })
    } catch (e) {
        console.log(e)
    }
};


const getBurnedVouchers = async (voucherIds: BigInt[]) => {
    try {
        const vouchersTempArr: any = []
        for (let i = 0; i < voucherIds.length; i++) {
            const voucher: any = await jocClientRead.readContract({
                address: STORE_VOUCHERS as any,
                abi: STORE_VOUCHERS_ABI,
                functionName: 'vouchers',
                args: [parseInt(voucherIds[i].toString())]
            })
            const {data} = await axios.get(voucher[5])

            vouchersTempArr.push({
                id: voucher[0],
                storeId: voucher[1],
                packId: voucher[2],
                isBurned: voucher[4],
                imgUrl: data?.imgUrl,
                description: data?.description,
                code: voucher[6],
            })
        }
        return vouchersTempArr
    } catch (e) {
        console.log(e)
    }
};

app.post('/decrypt', async (req, res) => {
    const {message, signature, voucherId, address} = req.body;
    if (!message || !signature || voucherId === undefined || !address) {
        return res.status(400).json({error: 'Message, signature, address, and voucherId are required'});
    }

    try {
        const isValid = await verifyMessage({
            message,
            signature,
            address,
        });
        if (isValid) {
            const burnedVouchersIds: any = await getBurnedVouchersIds(address)
            if (burnedVouchersIds.map((item: any) => parseInt(item)).includes(voucherId)) {
                const burnedVouchers: any = await getBurnedVouchers(burnedVouchersIds)
                const encryptedCode = burnedVouchers.find((voucher: any) => parseInt(voucher.id) === parseInt(voucherId)).code
                const decryptedCode = decrypt(encryptedCode)
                res.json({decryptedCode});
            } else {
                res.status(400).json({error: 'Voucher not found!'});
            }
        } else {
            res.status(400).json({error: 'Signature verification failed'});
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({error: 'Decryption failed'});
    }
});

app.listen(PORT, () => {
    console.info(`server up on port ${PORT}`)
})


