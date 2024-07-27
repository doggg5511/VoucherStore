import {useEffect, useState} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button.tsx";
import Loader from "@/components/share/Loader.tsx";
import {VoucherPackType} from "@/types";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {jocClientRead, jocConfig, jpaWalletClient} from "@/lib/wagmi.ts";
import {ERC_20_ABI} from "@/lib/abis/ERC_20_ABI.ts";
import {STORE_VOUCHERS} from "@/lib/contracts.ts";
import {formatEther, parseEther} from "viem";
import {useAccount} from "wagmi";
import globalStore from "@/store/globalStore.ts";
import {STORE_VOUCHERS_ABI} from "@/lib/abis/STORE_VOUCHERS_ABI.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {Tokens} from "@/lib/constants.ts";

export const BuyVoucher = ({
                               tokenName,
                               voucher,
                               tokenAllowance,
                               isOtherCoin,
                               getTokenAllowance
                           }: {
    tokenName: "USDT" | "JPY";
    voucher: VoucherPackType,
    tokenAllowance: string,
    isOtherCoin: boolean,
    getTokenAllowance: ({tokenName}: { tokenName: string; }) => Promise<void>
}) => {
    const {address, chainId} = useAccount()
    const [isLoadingApprove, setIsLoadingApprove] = useState(false)
    const [isLoadingSwap, setIsLoadingSwap] = useState(false)
    const {voucherPacks, setVoucherPacks} = globalStore()

    const handleApprove = async () => {
        if (chainId !== jocConfig.id) {
            toast.error('Please connect to JOC Testnet!')
            return
        }

        try {
            setIsLoadingApprove(true);
            const {request} = await jocClientRead.simulateContract({
                address: Tokens.find(token => token.value.toUpperCase() === tokenName.toUpperCase())?.address as any,
                abi: ERC_20_ABI,
                functionName: 'approve',
                args: [STORE_VOUCHERS, parseEther((parseFloat(voucher.price.toString()) * (isOtherCoin ? 1.05 : 1)).toString()).toString()],
                account: address,
            })
            const hash = await jpaWalletClient!.writeContract(request)
            await jocClientRead.waitForTransactionReceipt({hash: hash})

            await getTokenAllowance({tokenName})

            toast.success(hash);
            setIsLoadingApprove(false);
        } catch (e) {
            console.log(e)
            toast.error("Error!");
            setIsLoadingApprove(false);
        }
    };

    const handleBuy = async () => {
        if (chainId !== jocConfig.id) {
            toast.error('Please connect to JOC Testnet!')
            return
        }

        try {
            setIsLoadingSwap(true);
            const {request} = await jocClientRead.simulateContract({
                address: STORE_VOUCHERS as any,
                abi: STORE_VOUCHERS_ABI,
                functionName: 'purchaseVoucher',
                args: [voucher.storeId, voucher.index, Tokens.find(token => token.value.toUpperCase() === tokenName.toUpperCase())?.address],
                account: address,
            })
            const hash = await jpaWalletClient!.writeContract(request)
            await jocClientRead.waitForTransactionReceipt({hash: hash})

            await getTokenAllowance({tokenName})
            setVoucherPacks(voucherPacks.map(c => parseInt(c.id.toString()) === parseInt(voucher.id.toString())
                ? {
                    ...voucher,
                    totalSoldCount: voucher.totalSoldCount + 1
                }
                : voucher
            ))
            toast.success(hash);
            setIsLoadingSwap(false);
        } catch (e) {
            console.log(e)
            toast.error("Error!");
            setIsLoadingSwap(false);
        }
    };

    return (
        <Card className={'w-full mt-0'}>
            <div className={'flex w-full justify-center mt-1 pb-0 mb-0'}>
                <Badge variant={'outline'} className={'text-[18px] flex justify-center items-center'}>
                    {parseFloat(voucher.price.toString()).toFixed(5)}
                    <img
                        alt={''}
                        className={'w-5 h-5 ml-2'}
                        src={Tokens.find(token => token.value.toUpperCase() === tokenName)?.imgSrc ?? ''}
                    />
                </Badge>
            </div>
            <CardContent className={'pt-0 m-2 mt-0 p-2 flex items-center gap-4'}>
                <Button
                    disabled={isLoadingApprove || (voucher.price === "0" || voucher.price === "") || (tokenAllowance !== "" && parseFloat(voucher.price.toString()) <= parseFloat(tokenAllowance)) || (address === undefined)}
                    variant={'secondary'} className={"w-full"} onClick={handleApprove}
                >
                    {isLoadingApprove && <div><Loader/></div>}
                    Approve {tokenName}
                </Button>
                <Button
                    disabled={isLoadingSwap || (voucher.price === "0" || voucher.price === "") || (tokenAllowance !== "" && parseFloat(voucher.price.toString()) > parseFloat(tokenAllowance)) || (address === undefined)}
                    onClick={handleBuy} className={"w-full"}
                >
                    {isLoadingSwap && <div><Loader/></div>}
                    Buy with {tokenName}
                </Button>
            </CardContent>
        </Card>
    );
};
export const BuyModule = ({voucher}: {
    voucher: VoucherPackType | null
}) => {
    const {jpyPrice} = globalStore()
    const {address} = useAccount()
    const [isLoadingGetAllowance, setIsLoadingGetAllowance] = useState(false)

    const [tokenAllowanceValue, setTokenAllowanceValue] = useState<{ "USDT": string, "JPY": string }>({
        'USDT': "0",
        'JPY': "0"
    })

    const getTokenAllowance = async ({tokenName}: { tokenName: string }) => {
        try {
            setIsLoadingGetAllowance(true)
            const e: any = await jocClientRead.readContract({
                address: Tokens.find(token => token.value.toUpperCase() === tokenName.toUpperCase())?.address as any,
                abi: ERC_20_ABI,
                functionName: 'allowance',
                args: [address, STORE_VOUCHERS]
            })
            setTokenAllowanceValue(prev => ({
                ...prev,
                [tokenName]: formatEther(e)
            }))
            setIsLoadingGetAllowance(false)
        } catch (e) {
            setIsLoadingGetAllowance(false)
            console.log(e)
        }
    }

    useEffect(() => {
        if (address && voucher) {
            getTokenAllowance({tokenName: voucher.coin})
            if (voucher.acceptOtherCoin) {
                getTokenAllowance({tokenName: voucher.coin === 'USDT' ? 'JPY' : 'USDT'})
            }
        }
    }, [address, voucher]);

    return (
        <div className={"flex items-center justify-between gap-4 flex-col w-full"}>
            {voucher?.coin &&
                <BuyVoucher
                    voucher={voucher}
                    tokenName={voucher?.coin}
                    tokenAllowance={tokenAllowanceValue[voucher?.coin]}
                    isOtherCoin={false}
                    getTokenAllowance={getTokenAllowance}
                />
            }
            {voucher?.acceptOtherCoin &&
                <BuyVoucher
                    getTokenAllowance={getTokenAllowance}
                    isOtherCoin={true}
                    tokenAllowance={tokenAllowanceValue[voucher?.coin === "USDT" ? 'JPY' : 'USDT']}
                    tokenName={Tokens.find(token => token.value.toUpperCase() !== voucher?.coin)?.value.toUpperCase() as any}
                    voucher={{
                        ...voucher,
                        price: voucher?.coin === "USDT"
                            ? parseFloat(voucher.price.toString()) * parseFloat(jpyPrice.toString())
                            : parseFloat(voucher.price.toString()) / parseFloat(jpyPrice.toString())
                    }}
                />
            }
        </div>
    );
};
