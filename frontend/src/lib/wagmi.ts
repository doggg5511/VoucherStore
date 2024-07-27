import {createConfig} from "wagmi";
import {injected} from "wagmi/connectors";
import {Chain, createPublicClient, createWalletClient, custom, http} from "viem";
import {arbitrumSepolia} from "viem/chains";
import JocLogo from "@/assets/joc.ico";

export const jocConfig: Chain & { iconUrl: any } = {
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
    iconUrl: JocLogo,
    testnet: true,
};

export const config = createConfig({
    chains: [
        jocConfig,
        arbitrumSepolia
    ],
    connectors: [injected()],
    transports: {
        [jocConfig.id]: http(jocConfig.rpcUrls.default.http[0]),
        [arbitrumSepolia.id]: http(arbitrumSepolia.rpcUrls.default.http[0]),
    },
});

export const jocClientRead = createPublicClient({
    chain: jocConfig,
    transport: http(jocConfig.rpcUrls.default.http[0]),
});

export const arbitrumClientRead = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(arbitrumSepolia.rpcUrls.default.http[0]),
});

export const arbitrumWalletClient = createWalletClient({
    chain: arbitrumSepolia,
    transport: window.ethereum
        ? custom(window.ethereum)
        : http(arbitrumSepolia.rpcUrls.default.http[0]),
});


export const jpaWalletClient = createWalletClient({
    chain: jocConfig,
    transport: window.ethereum
        ? custom(window.ethereum)
        : http(jocConfig.rpcUrls.default.http[0]),
});

export const walletClient = createWalletClient({
    transport: custom(window.ethereum!)
})

