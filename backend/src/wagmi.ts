import {createPublicClient, http} from "viem";

export const jocConfig = {
    id: 10081,
    name: "Japan Open Chain Testnet",
    nativeCurrency: {name: "Japan Open Chain (Testnet)", symbol: "JOCT", decimals: 18},
    rpcUrls: {
        default: {
            http: ["https://rpc-1.testnet.japanopenchain.org:8545"],
        },
    },
    blockExplorers: {
        default: {
            name: "Blockscan",
            url: "https://explorer.testnet.japanopenchain.org/",
        },
    },
    testnet: true,
}

export const jocClientRead = createPublicClient({
    chain: jocConfig,
    transport: http(jocConfig.rpcUrls.default.http[0]),
});
