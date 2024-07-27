import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card.tsx";
import {ClockIcon, FlameIcon, ImageIcon, InfoIcon, SendIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import React, {useCallback, useEffect, useState} from "react";
import {VoucherType} from "@/types";
import globalStore from "@/store/globalStore.ts";
import {jocClientRead, jocConfig, jpaWalletClient} from "@/lib/wagmi.ts";
import {STORE_VOUCHERS} from "@/lib/contracts.ts";
import {STORE_VOUCHERS_ABI} from "@/lib/abis/STORE_VOUCHERS_ABI.ts";
import axios from "axios";
import {useParams} from "react-router-dom";
import {useAccount} from "wagmi";
import Loader from "@/components/share/Loader.tsx";
import {toast} from "sonner";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {TransferModal} from "@/pages/Profile/TransferModal.tsx";
import {ProfileDescriptionModal} from "@/pages/Profile/ProfileDescriptionModal.tsx";
import {PROXY} from "@/lib/constants.ts";
import {timestampToDate} from "@/lib/functions.ts";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Badge} from "@/components/ui/badge.tsx";

type NotUsedVouchersProps = {
    item: VoucherType | null;
    getBalance: () => void;
    setIsOpenTransferModal: (status: boolean) => void;
    setSelectedVoucher: (voucher: any) => void;
    setIsOpenDetailsModal: (status: boolean) => void;
};

export const NotUsedVouchersWrapper = () => {
    const {address} = useAccount()
    const {storeId, walletAddress} = useParams()
    const {selectedStore, setIsOpenStoreMobileMenu, isOpenStoreMobileMenu, setVouchers, isLoadingGetVoucherPacks, setIsLoadingGetVoucherPacks, voucherPacks, vouchers, setStores, setVoucherPacks} = globalStore()

    const [isOpenDetailsModal, setIsOpenDetailsModal] = useState(false);
    const [isOpenTransferModal, setIsOpenTransferModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<VoucherType | null>(null);
    const [isLoadingGetVouchers, setIsLoadingGetVouchers] = useState(false)
    const [contractBalance, setContractBalance] = useState(0)

    const getBalance = async () => {
        try {
            setIsLoadingGetVouchers(true)
            const e: any = await jocClientRead.readContract({
                address: STORE_VOUCHERS as any,
                abi: STORE_VOUCHERS_ABI,
                functionName: 'balanceOf',
                args: [walletAddress]
            })
            setContractBalance(parseInt(e))

            const vouchersTempArr: any = []
            for (let i = 0; i < parseInt(e); i++) {
                const voucherId: any = await jocClientRead.readContract({
                    address: STORE_VOUCHERS as any,
                    abi: STORE_VOUCHERS_ABI,
                    functionName: 'tokenOfOwnerByIndex',
                    args: [walletAddress, i]
                })

                const voucher: any = await jocClientRead.readContract({
                    address: STORE_VOUCHERS as any,
                    abi: STORE_VOUCHERS_ABI,
                    functionName: 'vouchers',
                    args: [voucherId]
                })
                const {data} = await axios.get(`${PROXY}${voucher[5]}`)

                vouchersTempArr.push({
                    id: voucher[0],
                    storeId: voucher[1],
                    packId: voucher[2],
                    isBurned: voucher[4],
                    imgUrl: `${PROXY}${data?.imgUrl}`,
                    description: data?.description,
                    code: voucher[6],
                    expiredTimestamp: voucher[7].toString()
                })
            }
            setVouchers(vouchersTempArr)
            setIsLoadingGetVouchers(false)

            // setTokenAllowanceValue(formatEther(e))
        } catch (e) {
            console.log(e)
            setIsLoadingGetVouchers(false)
        }
    };

    useEffect(() => {
        if (walletAddress) {
            getBalance()
        }
    }, [walletAddress]);

    return <>
        <ProfileDescriptionModal
            isOpenDetailsModal={isOpenDetailsModal}
            setIsOpenDetailsModal={setIsOpenDetailsModal}
            selectedVoucher={selectedVoucher}
            setSelectedVoucher={setSelectedVoucher}
        />
        <TransferModal
            getBalance={getBalance}
            isOpenTransferModal={isOpenTransferModal}
            setSelectedVoucher={setSelectedVoucher}
            selectedVoucher={selectedVoucher}
            setIsOpenTransferModal={setIsOpenTransferModal}
        />
        <div
            className={
                "grid grid-cols-1 gap-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }
        >
            {isLoadingGetVouchers ? <Loader/> : vouchers?.map((voucher) => (
                <NotUsedVouchers
                    key={voucher.id + '-' + voucher.storeId}
                    setIsOpenTransferModal={setIsOpenTransferModal}
                    item={voucher}
                    getBalance={getBalance}
                    setSelectedVoucher={setSelectedVoucher}
                    setIsOpenDetailsModal={setIsOpenDetailsModal}
                />
            ))}
        </div>
    </>
}

const NotUsedVouchers = ({
                             item,
                             getBalance,
                             setSelectedVoucher,
                             setIsOpenDetailsModal,
                             setIsOpenTransferModal
                         }: NotUsedVouchersProps) => {
    const [isLoadingBurn, setIsLoadingBurn] = useState(false)
    const {address, chainId} = useAccount()
    const {walletAddress} = useParams()

    const handleOpenDescriptionModal = useCallback(() => {
        setIsOpenDetailsModal(true);
        setSelectedVoucher(item);
    }, []);

    const handleOpenTranferModal = useCallback(() => {
        setIsOpenTransferModal(true);
        setSelectedVoucher(item);
    }, []);

    const handleBurn = async () => {
        if (chainId !== jocConfig.id) {
            toast.error('Please connect to JOC Testnet!')
            return
        }

        try {
            setIsLoadingBurn(true);
            const {request} = await jocClientRead.simulateContract({
                address: STORE_VOUCHERS as any,
                abi: STORE_VOUCHERS_ABI,
                functionName: 'burnVoucher',
                args: [item?.id],
                account: address,
            })
            const hash = await jpaWalletClient!.writeContract(request)
            await jocClientRead.waitForTransactionReceipt({hash: hash})

            await getBalance()

            toast.success(hash);
            setIsLoadingBurn(false);
        } catch (e) {
            console.log(e)
            toast.error("Error!");
            setIsLoadingBurn(false);
        }
    };

    return (
        <Card className={'bg-gray-100 dark:bg-gray-900'}>
            <CardHeader className={"pb-1"}>
                {item?.id !== undefined &&
                    <CardTitle className={"text-md"}>
                        <Alert className={'p-1 m-1 flex justify-between w-full items-center'}>
                            <AlertTitle className={'p-0 m-1'}>Voucher #{parseInt(item?.id.toString())}</AlertTitle>
                        </Alert>
                    </CardTitle>
                }
                <div
                    className={
                        "relative flex h-40 items-center justify-center rounded-md bg-secondary"
                    }
                >
                    {item?.imgUrl !== "" ? (
                        <img
                            src={item?.imgUrl}
                            alt=""
                            className={"h-full w-full rounded-md object-cover object-center"}
                        />
                    ) : (
                        <ImageIcon className={" "} size={30}/>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Alert className={'p-2 m-0 mb-2'}>
                    <div className={'flex justify-between w-full  items-center'}>
                        <div className={'flex items-center gap-2'}>
                            <ClockIcon size={15}/> Expire:
                        </div>
                        {(new Date().getTime()) > (new Date(item?.expiredTimestamp as any).getTime())
                            ? <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge variant={'destructive'} className={'flex items-center gap-2'}>
                                            Expired
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{timestampToDate(parseInt(item?.expiredTimestamp as any), 'FULL')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            : <div className={'text-muted-foreground'}>
                                {timestampToDate(parseInt(item?.expiredTimestamp as any), 'FULL')}
                            </div>
                        }
                    </div>
                </Alert>

                <Card
                    className={
                        "mt-1 mb-0 line-clamp-3 overflow-hidden text-ellipsis whitespace-pre-line"
                    }
                >
                    <CardContent className={'m-0 p-1 px-2'}>
                        {item?.description}
                    </CardContent>
                </Card>
            </CardContent>
            <CardFooter className={"flex flex-col gap-2 w-full"}>
                <div className={"flex gap-2 w-full"}>
                    <Button
                        variant={"secondary"}
                        onClick={handleOpenDescriptionModal}
                        className={"w-full"}
                        size={"sm"}
                    >
                        Details
                        <InfoIcon size={15} className={"ml-2"}/>
                    </Button>
                    {address === walletAddress &&
                        <Button
                            variant={"destructive"}
                            onClick={handleBurn}
                            className={"w-full"}
                            size={"sm"}
                            disabled={isLoadingBurn}
                        >
                            {isLoadingBurn && <Loader/>}
                            Burn
                            <FlameIcon size={15} className={"ml-2"}/>
                        </Button>
                    }
                </div>
                {address === walletAddress &&
                    <Button
                        variant={"secondary"}
                        onClick={handleOpenTranferModal}
                        className={"w-full"}
                        size={"sm"}
                    >
                        Transfer
                        <SendIcon size={15} className={"ml-2"}/>
                    </Button>
                }
            </CardFooter>
        </Card>
    );
};

export default NotUsedVouchers;
