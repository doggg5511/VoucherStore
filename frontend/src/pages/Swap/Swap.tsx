import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card.tsx";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {OctagonAlert, RefreshCcw} from "lucide-react";
import {toast} from "sonner";
import Loader from "@/components/share/Loader.tsx";
import {TokenItem} from "@/pages/Swap/TokenItem.tsx";
import {jocClientRead, jocConfig, jpaWalletClient} from "@/lib/wagmi.ts";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {useAccount, useSwitchChain} from "wagmi";
import {useDebouncedValue} from "@/hooks/useDebouncedValue.ts";
import {TOKEN_EXCHANGER_ABI} from "@/lib/abis/TOKEN_EXCHANGER_ABI.ts";
import {formatEther, parseEther} from "viem";
import {TOKEN_EXCHANGER_JOC_TESTNET} from "@/lib/contracts.ts";
import {ERC_20_ABI} from "@/lib/abis/ERC_20_ABI.ts";
import {Tokens} from "@/lib/constants.ts";

const Swap = () => {
    const {switchChain} = useSwitchChain()

    const {chainId, address} = useAccount()

    const [amountToken1, setAmountToken1] = useState("0");
    const [amountToken2, setAmountToken2] = useState("0");

    const [token1, setToken1] = useState<'usdt' | 'jpy'>("usdt");
    const [token2, setToken2] = useState<'usdt' | 'jpy'>("jpy");

    const [isLoadingSwap, setIsLoadingSwap] = useState(false);
    const [isLoadingApprove, setIsLoadingApprove] = useState(false);

    const [tokensBalance, setTokensBalance] = useState({
        "usdt": 0,
        "jpy": 0
    })

    const [debounced] = useDebouncedValue(amountToken1, 500);

    const [isLoadingConvertedAmount, setIsLoadingConvertedAmount] = useState(false)

    const [isLoadingGetAllowance, setIsLoadingGetAllowance] = useState(false)
    const [tokenAllowanceValue, setTokenAllowanceValue] = useState('0')

    const handleToggleTokens = () => {
        const tokenTemp = token1;
        setToken1(token2);
        setToken2(tokenTemp);
        const tempAmount = amountToken1;
        setAmountToken1(amountToken2);
        setAmountToken2(tempAmount);
    };

    const onChangeToken1 = (e: any) => {
        if (e === token2) {
            setToken2(token1);
        }
        setToken1(e);
    };

    const onChangeToken2 = (e: any) => {
        if (e === token2) {
            setToken2(token1);
        }
        setToken1(e);
    };

    const onChangeAmount1 = (value: any) => {
        if (!isNaN(value)) {
            const finalValue: any = Math.max(0, Math.min(Number(tokensBalance[token1]), Number(value)));
            setAmountToken1(finalValue);
        }
    };

    const onChangeAmount2 = (value: any) => {
        setAmountToken2(value);
    };

    const getBalance = async ({tokenName, tokenAddress}: { tokenName: string, tokenAddress: string }) => {
        try {
            const e: any = await jocClientRead.readContract({
                address: tokenAddress as any,
                abi: ERC_20_ABI,
                functionName: 'balanceOf',
                args: [address]
            })
            setTokensBalance(prev => ({
                ...prev,
                [tokenName]: formatEther(e)
            }))
            // setTokenAllowanceValue(formatEther(e))
        } catch (e) {
            console.log(e)
        }
    };

    const getAllTokensBalance = () => {
        if (Tokens.find(token => token.value === 'usdt'))
            getBalance({
                tokenAddress: Tokens.find(token => token.value === 'usdt')!.address,
                tokenName: 'usdt'
            })
        if (Tokens.find(token => token.value === 'jpy'))
            getBalance({
                tokenAddress: Tokens.find(token => token.value === 'jpy')!.address,
                tokenName: 'jpy'
            })
    }

    const handleSwap = async () => {
        try {
            setIsLoadingSwap(true);

            const {request} = await jocClientRead.simulateContract({
                address: TOKEN_EXCHANGER_JOC_TESTNET,
                abi: TOKEN_EXCHANGER_ABI,
                functionName: token1 === 'usdt' ? 'exchangeUSDTtoJPY' : 'exchangeJPYtoUSDT',
                args: [parseEther(amountToken1.toString())],
                account: address,
            })
            const hash = await jpaWalletClient!.writeContract(request)
            const transaction = await jocClientRead.waitForTransactionReceipt({hash: hash})

            getAllTokensBalance()

            setIsLoadingSwap(false);
            toast.success(hash);
        } catch (e) {
            console.log(e)
            toast.error("Error!");
            setIsLoadingSwap(false);
        }
    };

    const handleApprove = async () => {
        try {
            setIsLoadingApprove(true);
            const {request} = await jocClientRead.simulateContract({
                address: Tokens.find(token => token.value === token1)?.address as any,
                abi: ERC_20_ABI,
                functionName: 'approve',
                args: [TOKEN_EXCHANGER_JOC_TESTNET, parseEther(amountToken1.toString())],
                account: address,
            })
            const hash = await jpaWalletClient!.writeContract(request)
            await jocClientRead.waitForTransactionReceipt({hash: hash})

            getConvertedAmount()
            getAllowance()

            toast.success(hash);
            setIsLoadingApprove(false);
        } catch (e) {
            console.log(e)
            toast.error("Error!");
            setIsLoadingApprove(false);
        }
    };

    const getConvertedAmount = async () => {
        if (token1)
            try {
                setIsLoadingConvertedAmount(true)
                const e: any = await jocClientRead.readContract({
                    address: TOKEN_EXCHANGER_JOC_TESTNET,
                    abi: TOKEN_EXCHANGER_ABI,
                    functionName: token1 === 'usdt' ? 'getConvertedAmountUSDTtoJPY' : 'getConvertedAmountJPYtoUSDT',
                    args: [parseEther(amountToken1.toString())]
                })
                setAmountToken2(amountToken1 === "" ? "" : formatEther(e))
                setIsLoadingConvertedAmount(false)
            } catch (e) {
                setIsLoadingConvertedAmount(false)
                console.log(e)
            }
    }

    const getAllowance = async () => {
        if (Tokens.find(token => token.value === token1) !== undefined && token1)
            try {
                setIsLoadingGetAllowance(true)
                const e: any = await jocClientRead.readContract({
                    address: Tokens.find(token => token.value === token1)?.address as any,
                    abi: ERC_20_ABI,
                    functionName: 'allowance',
                    args: [address, TOKEN_EXCHANGER_JOC_TESTNET]
                })

                setTokenAllowanceValue(formatEther(e))
                setIsLoadingGetAllowance(false)
            } catch (e) {
                setIsLoadingGetAllowance(false)
                console.log(e)
            }
    }

    useEffect(() => {
        getConvertedAmount()
        getAllowance()
    }, [debounced]);

    useEffect(() => {
        if (address) {
            getAllTokensBalance()
        }
    }, [address]);

    return (
        <div className={"mb-10 px-0 sm:px-1 md:px-6 lg:px-36 xl:px-52"}>
            {address !== undefined && chainId !== jocConfig.id &&
                <Alert className={'mb-5'}>
                    <AlertTitle className={'text-red-500 font-bold flex gap-2 items-center'}>
                        <OctagonAlert/> Please connect to JOC Testnet
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
                    <CardTitle>Swap</CardTitle>
                    <CardDescription>Swap tokens</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className={"flex flex-col gap-2"}>
                        <TokenItem
                            amountToken={amountToken1}
                            onChangeToken={onChangeToken1}
                            token={token1}
                            onChangeAmount={onChangeAmount1}
                            readOnly={false}
                            tokensBalance={tokensBalance}
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
                        <TokenItem
                            amountToken={amountToken2}
                            onChangeToken={onChangeToken2}
                            token={token2}
                            onChangeAmount={onChangeAmount2}
                            readOnly
                            tokensBalance={tokensBalance}
                        />
                    </div>
                </CardContent>

                {address !== undefined && chainId !== jocConfig.id
                    ? <CardFooter>
                        <div className={"flex w-full items-center justify-between gap-4"}>
                            <Button className={"w-full"} onClick={() => {
                                switchChain({chainId: jocConfig.id})
                            }}>
                                Switch to JOC
                            </Button>
                        </div>
                    </CardFooter>
                    : <CardFooter>
                        <div className={"flex w-full items-center justify-between gap-4"}>
                            <Button
                                disabled={isLoadingApprove || (amountToken1 === "0" || amountToken1 === "") || (tokenAllowanceValue !== "" && parseFloat(amountToken1) <= parseFloat(tokenAllowanceValue)) || (address === undefined) || (chainId !== jocConfig.id) || isLoadingConvertedAmount}
                                className={"w-full"}
                                onClick={handleApprove}
                            >
                                {(isLoadingApprove || isLoadingConvertedAmount) && (<Loader/>)}
                                Approve
                            </Button>
                            <Button
                                disabled={isLoadingSwap || (amountToken1 === "0" || amountToken1 === "") || (tokenAllowanceValue !== "" && parseFloat(amountToken1) > parseFloat(tokenAllowanceValue)) || (address === undefined) || (chainId !== jocConfig.id) || isLoadingConvertedAmount}
                                className={"w-full"}
                                onClick={handleSwap}
                            >
                                {(isLoadingSwap || isLoadingConvertedAmount) && (<Loader/>)}
                                Swap
                            </Button>
                        </div>
                    </CardFooter>
                }


            </Card>
        </div>
    );
};

export default Swap;
