import ArbLogo from '../assets/arb.svg'
import JocLogo from '../assets/joc.ico'
import ImageUSDT from "@/assets/usdt.webp";
import {JPY_JOC_TESTNET, USDT_JOC_TESTNET} from "@/lib/contracts.ts";
import ImageJPYC from "@/assets/jpyc.webp";

export const Chains: {
    value: "arbitrum" | "joc",
    label: string,
    imgSrc: string
}[] = [
    {
        value: "arbitrum",
        label: "Arbitrum Sepolia",
        imgSrc: ArbLogo,
    },
    {
        value: "joc",
        label: "JOC Testnet",
        imgSrc: JocLogo,
    },
];

export const PROXY = ''

export const COINMARKETCAP_BASE_URL = 'https://pro-api.coinmarketcap.com/v2/'

export const LAYER_ZERO_SCAN = 'https://testnet.layerzeroscan.com/tx/'

export const NAVBAR_LINKS = [
    {path: "bridge", label: "Bridge JPY"},
    {path: "swap", label: "Swap"},
    {path: "faucet", label: "Faucet"},
];

export const Tokens: {
    value: "usdt" | 'jpy',
    label: "USDT" | "JPY",
    imgSrc: string,
    address: string,
}[] = [
    {
        value: "usdt",
        label: "USDT",
        imgSrc: ImageUSDT,
        address: USDT_JOC_TESTNET
    },
    {
        value: "jpy",
        label: "JPY",
        imgSrc: ImageJPYC,
        address: JPY_JOC_TESTNET
    },
];

export const EID_JOC_TESTNET = 40242

export const EID_ARBITRUM_SEPOLIA = 40231