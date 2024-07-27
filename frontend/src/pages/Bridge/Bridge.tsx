import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card.tsx";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {OctagonAlert, RefreshCcw} from "lucide-react";
import {Chains, EID_ARBITRUM_SEPOLIA, EID_JOC_TESTNET, LAYER_ZERO_SCAN, Tokens} from "@/lib/constants.ts";
import {toast} from "sonner";
import {Badge} from "@/components/ui/badge.tsx";
import LayerZeroImg from '@/assets/layerzero.png'
import Loader from "@/components/share/Loader.tsx";
import {ChainItem} from "@/pages/Bridge/ChainItem.tsx";
import {arbitrumClientRead, arbitrumWalletClient, jocClientRead, jocConfig, jpaWalletClient} from "@/lib/wagmi.ts";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {useAccount, useSwitchChain} from "wagmi";
import {arbitrumSepolia} from "viem/chains";
import {ERC_20_ABI} from "@/lib/abis/ERC_20_ABI.ts";
import {formatEther, pad, parseEther} from "viem";
import {JPY_ARBITRUM_SEPOLIA, JPY_JOC_TESTNET, JPY_OFT_ADAPTER_JOC_TESTNET} from "@/lib/contracts.ts";
import {useDebouncedValue} from "@/hooks/useDebouncedValue.ts";
import {JPY_ARBITRUM_SEPOLIA_ABI} from "@/lib/abis/JPY_ARBITRUM_SEPOLIA_ABI.ts";

const Bridge = () => {
    const {switchChain} = useSwitchChain()
    const {chainId, address} = useAccount()

    const [amountToken1, setAmountToken1] = useState<string>("");
    const [amountToken2, setAmountToken2] = useState<string>("");

    const [chain1, setChain1] = useState<"arbitrum" | "joc">(Chains[0].value);
    const [chain2, setChain2] = useState<"arbitrum" | "joc">(Chains[1].value);

    const [isLoadingBridge, setIsLoadingBridge] = useState(false);
    const [isLoadingApprove, setIsLoadingApprove] = useState(false);

    const [tokenBalance, setTokenBalance] = useState({
        "arbitrum": 0,
        "joc": 0
    })

    const [isLoadingGetAllowance, setIsLoadingGetAllowance] = useState(false)
    const [tokenAllowanceValue, setTokenAllowanceValue] = useState('0')

    const [debounced] = useDebouncedValue(amountToken1, 500);

    const getBalance = async ({chainName, tokenAddress, provider}: { chainName: string, tokenAddress: string, provider: any }) => {
        try {
            const e: any = await provider.readContract({
                address: tokenAddress as any,
                abi: ERC_20_ABI,
                functionName: 'balanceOf',
                args: [address]
            })
            setTokenBalance(prev => ({
                ...prev,
                [chainName]: formatEther(e)
            }))
        } catch (e) {
            console.log(e)
        }
    };

    const getAllTokensBalance = () => {
        if (Tokens.find(token => token.value === 'jpy')) {
            getBalance({
                tokenAddress: JPY_ARBITRUM_SEPOLIA,
                chainName: 'arbitrum',
                provider: arbitrumClientRead
            })
            getBalance({
                tokenAddress: Tokens.find(token => token.value === 'jpy')!.address,
                chainName: 'joc',
                provider: jocClientRead
            })
        }
    }

    const handleToggleTokens = () => {
        const tokenTemp = chain1;
        setChain1(chain2);
        setChain2(tokenTemp);
        const tempAmount = amountToken1;
        setAmountToken1(amountToken2);
        setAmountToken2(tempAmount);
    };

    const onChangeToken1 = (e: "arbitrum" | "joc") => {
        if (e === chain2) {
            setChain2(chain1);
        }
        setChain1(e);
    };

    const onChangeToken2 = (e: "arbitrum" | "joc") => {
        if (e === chain1) {
            setChain1(chain2);
        }
        setChain2(e);
    };

    const onChangeTokenAmount1 = (value: any) => {
        if (!isNaN(value)) {
            const finalValue: any = Math.max(0, Math.min(Number(tokenBalance[chain1]), Number(value)));
            setAmountToken1(finalValue);
            setAmountToken2(finalValue);
        }
    };

    const onChangeTokenAmount2 = (value: any) => {
    };

    const handleBridge = async () => {
        try {
            setIsLoadingBridge(true);
            const {request} = await (chain1 === 'joc' ? jocClientRead : arbitrumClientRead).simulateContract({
                address: chain1 === 'joc' ? JPY_OFT_ADAPTER_JOC_TESTNET : JPY_ARBITRUM_SEPOLIA,
                abi: JPY_ARBITRUM_SEPOLIA_ABI,
                functionName: 'send',
                args: [
                    [
                        chain1 === 'joc' ? EID_ARBITRUM_SEPOLIA : EID_JOC_TESTNET,
                        pad(address as any),
                        parseEther(amountToken1.toString()),
                        parseEther(amountToken1.toString()),
                        "0x00030100110100000000000000000000000000030d40",
                        "0x",
                        "0x"
                    ],
                    ["10000000000000000", "0"],
                    address
                ],
                account: address,
                value: parseEther("0.01")
            })
            const hash = await (chain1 === 'joc' ? jpaWalletClient : arbitrumWalletClient)!.writeContract(request)
            await (chain1 === 'joc' ? jocClientRead : arbitrumClientRead).waitForTransactionReceipt({hash: hash})

            toast(
                <div className={'flex flex-col'}>
                    <div>Your bridge is in progress.</div>
                    <div>
                        <a className={'underline font-semibold'} href={`${LAYER_ZERO_SCAN}${hash}`} target="_blank" rel="noreferrer">
                            Check your status in LayerZero Scan
                        </a>
                    </div>
                </div>
            )

            setIsLoadingBridge(false);
        } catch (e) {
            console.log(e)
            toast.error("Error!");
            setIsLoadingBridge(false);
        }
    };

    const getAllowanceOnJoc = async () => {
        try {
            setIsLoadingGetAllowance(true)
            const e: any = await jocClientRead.readContract({
                address: JPY_JOC_TESTNET as any,
                abi: ERC_20_ABI,
                functionName: 'allowance',
                args: [address, JPY_OFT_ADAPTER_JOC_TESTNET]
            })

            setTokenAllowanceValue(formatEther(e))
            setIsLoadingGetAllowance(false)
        } catch (e) {
            setIsLoadingGetAllowance(false)
            console.log(e)
        }
    }

    const handleApprove = async () => {
        try {
            setIsLoadingApprove(true);
            const {request} = await jocClientRead.simulateContract({
                address: JPY_JOC_TESTNET as any,
                abi: ERC_20_ABI,
                functionName: 'approve',
                args: [JPY_OFT_ADAPTER_JOC_TESTNET, parseEther(amountToken1.toString())],
                account: address,
            })
            const hash = await jpaWalletClient!.writeContract(request)
            await jocClientRead.waitForTransactionReceipt({hash: hash})

            getAllowanceOnJoc()

            toast.success(hash);
            setIsLoadingApprove(false);
        } catch (e) {
            console.log(e)
            toast.error("Error!");
            setIsLoadingApprove(false);
        }
    };

    useEffect(() => {
        if (chain1 === 'joc') {
            getAllowanceOnJoc()
        }
    }, [debounced, chainId, chain1]);

    useEffect(() => {
        if (address) {
            getAllTokensBalance()
        }
    }, [address]);

    return (
        <div className={"mb-10 px-0 sm:px-1 md:px-6 lg:px-36 xl:px-52"}>
            {address !== undefined && chainId !== undefined && ![jocConfig.id, arbitrumSepolia.id].includes(chainId as any) &&
                <Alert className={'mb-5'}>
                    <AlertTitle className={'text-red-500 font-bold flex gap-2 items-center'}>
                        <OctagonAlert/> Please connect to JOC Testnet / Arbitrum Sepolia
                    </AlertTitle>
                </Alert>
            }

            {address === undefined &&
                <Alert className={'mb-5'}>
                    <AlertTitle className={'text-red-500 font-bold flex gap-2 items-center'}>
                        <OctagonAlert/> Please connect Metamask
                    </AlertTitle>
                </Alert>
            }

            <Card className={'bg-gray-100 dark:bg-gray-900'}>
                <CardHeader>
                    <div className={'flex w-full justify-between'}>
                        <CardTitle>Bridge JPY</CardTitle>
                    </div>
                    <CardDescription>Bridge JPY</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className={"flex flex-col gap-2"}>
                        <ChainItem
                            onChangeTokenAmount={onChangeTokenAmount1}
                            type={"From"}
                            amountToken={amountToken1}
                            onChangeToken={onChangeToken1}
                            chain={chain1}
                            tokenBalance={tokenBalance}
                        />
                        <div className={"flex items-center justify-center"}>
                            <Button
                                className={"h-min rounded-full p-1"}
                                variant={"outline"}
                                onClick={handleToggleTokens}
                            >
                                <RefreshCcw/>
                            </Button>
                        </div>
                        <ChainItem
                            onChangeTokenAmount={onChangeTokenAmount2}
                            type={"To"}
                            amountToken={amountToken2}
                            onChangeToken={onChangeToken2}
                            chain={chain2}
                            tokenBalance={tokenBalance}
                        />
                    </div>
                </CardContent>

                {address !== undefined
                && ((chainId !== undefined && ![jocConfig.id, arbitrumSepolia.id].includes(chainId as any)) || chainId !== (chain1 === 'arbitrum' ? arbitrumSepolia.id : jocConfig.id))
                    ? <CardFooter>
                        <div className={"flex w-full items-center justify-between gap-4"}>
                            <Button className={"w-full"} onClick={() => {
                                switchChain(chain1 === 'arbitrum' ? {chainId: arbitrumSepolia.id} : {chainId: jocConfig.id})
                            }}>
                                {isLoadingBridge && (<Loader/>)}
                                Switch to {chain1.toUpperCase()}
                            </Button>
                        </div>
                    </CardFooter>
                    : <CardFooter>
                        <div className={"flex w-full items-center justify-between gap-4"}>
                            {chain1 === "joc" && (
                                <Button
                                    disabled={isLoadingApprove || (amountToken1 === "0" || amountToken1 === "") || (tokenAllowanceValue !== "" && parseFloat(amountToken1) <= parseFloat(tokenAllowanceValue)) || (address === undefined) || (chainId !== jocConfig.id)}
                                    className={"w-full"}
                                    onClick={handleApprove}
                                >
                                    {(isLoadingApprove) && (<Loader/>)}
                                    Approve
                                </Button>
                            )}
                            <Button
                                disabled={(amountToken1 === "0" || amountToken1 === "") || (address === undefined)}
                                className={"w-full"} onClick={handleBridge}
                            >
                                {isLoadingBridge && (<Loader/>)}
                                Bridge
                            </Button>
                        </div>
                    </CardFooter>
                }


            </Card>
            <div className={'flex justify-center mt-4'}>
                <Badge className={'pl-0 py-0 text-[18px] flex gap-2'}>
                    <img className={'w-7 h-7'} src={LayerZeroImg} alt={''}/>
                    <div>Powered by LayerZero</div>
                </Badge>
            </div>
        </div>
    );
};

export default Bridge;
