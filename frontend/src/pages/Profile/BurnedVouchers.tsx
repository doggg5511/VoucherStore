import {Card, CardContent, CardFooter, CardHeader,} from "@/components/ui/card.tsx";
import {ClockIcon, CopyIcon, ImageIcon, InfoIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import React, {useCallback, useEffect, useState} from "react";
import {VoucherType} from "@/types";
import globalStore from "@/store/globalStore.ts";
import {jocClientRead, walletClient} from "@/lib/wagmi.ts";
import {STORE_VOUCHERS} from "@/lib/contracts.ts";
import {STORE_VOUCHERS_ABI} from "@/lib/abis/STORE_VOUCHERS_ABI.ts";
import axios from "axios";
import {useParams} from "react-router-dom";
import {useAccount} from "wagmi";
import Loader from "@/components/share/Loader.tsx";
import {apiDecrypt} from "@/apis";
import {useClipboard} from "@/hooks/useClipboard.ts";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {toast} from "sonner";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {ProfileDescriptionModal} from "@/pages/Profile/ProfileDescriptionModal.tsx";
import {PROXY} from "@/lib/constants.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {timestampToDate} from "@/lib/functions.ts";

type BurnedVouchersProps = {
    item: VoucherType | null;
    setSelectedVoucher: (voucher: any) => void;
    setIsOpenDetailsModal: (status: boolean) => void;
};


export const BurnedVouchersWrapper = () => {
    const {storeId, walletAddress} = useParams()
    const {setVouchers, vouchers} = globalStore()

    const [isOpenDetailsModal, setIsOpenDetailsModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<VoucherType | null>(null);
    const [isLoadingGetVouchers, setIsLoadingGetVouchers] = useState(false)

    const getBalance = async () => {
        try {
            setIsLoadingGetVouchers(true)
            const voucherIds: any = await jocClientRead.readContract({
                address: STORE_VOUCHERS as any,
                abi: STORE_VOUCHERS_ABI,
                functionName: 'getBurnedVouchers',
                args: [walletAddress]
            })

            const vouchersTempArr: any = []
            for (let i = 0; i < voucherIds.length; i++) {
                const voucher: any = await jocClientRead.readContract({
                    address: STORE_VOUCHERS as any,
                    abi: STORE_VOUCHERS_ABI,
                    functionName: 'vouchers',
                    args: [parseInt(voucherIds[i])]
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
        <div
            className={
                "grid grid-cols-1 gap-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }
        >
            {isLoadingGetVouchers ? <Loader/> : vouchers?.map((voucher) => (
                <BurnedVouchers
                    key={voucher.id + '-' + voucher.storeId}
                    item={voucher}
                    setSelectedVoucher={setSelectedVoucher}
                    setIsOpenDetailsModal={setIsOpenDetailsModal}
                />
            ))}
        </div>
    </>
}

const BurnedVouchers = ({
                            item,
                            setSelectedVoucher,
                            setIsOpenDetailsModal,
                        }: BurnedVouchersProps) => {
    const [revealedCode, setRevealedCode] = useState('')
    const {copy} = useClipboard();
    const {walletAddress} = useParams()

    const handleOpenDescriptionModal = useCallback(() => {
        setIsOpenDetailsModal(true);
        setSelectedVoucher(item);
    }, []);

    const {address} = useAccount()
    const [isLoadingRevealCode, setIsLoadingRevealCode] = useState(false)

    const handleRevealCode = async () => {
        try {
            setIsLoadingRevealCode(true)
            const signature = await walletClient.signMessage({
                account: address as any,
                message: `View code ${item?.id}`,
            })
            if (item?.code) {
                const decryptedCode = await apiDecrypt({
                    voucherId: parseInt(item.id.toString()),
                    address: address as any,
                    message: `View code ${item?.id}`,
                    signature: signature,
                })
                setRevealedCode(decryptedCode)
            }
            setIsLoadingRevealCode(false)
            toast.success('Successfully revealed!')
        } catch (e) {
            console.log(e)
            setIsLoadingRevealCode(false)
            toast.success('Error!')
        }
    }

    return (
        <Card className={'bg-gray-100 dark:bg-gray-900'}>
            <CardHeader className={"pb-1"}>
                {item?.id !== undefined &&
                    <Alert className={'p-1 m-1 flex justify-between w-full items-center mt-4'}>
                        <AlertTitle className={'p-0 m-1'}>Voucher #{parseInt(item?.id.toString())}</AlertTitle>
                    </Alert>
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
            <CardFooter className={"flex gap-2 flex-col w-dull"}>
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
                    <>
                        {revealedCode !== ''
                            ? <Card className={'w-full bg-green-400'}>
                                <CardContent
                                    className={'m-2 p-0 w-full text-center items-center flex-row flex justify-center'}>
                                    <div>{revealedCode}</div>
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button onClick={() => copy(revealedCode)} variant={'ghost'}
                                                        className={'ml-2 w-5 h-5 p-0'}>
                                                    <CopyIcon size={15}/>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Copy</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </CardContent>
                            </Card>
                            : <Button
                                variant={"secondary"}
                                onClick={handleRevealCode}
                                className={"w-full"}
                                size={"sm"}
                                disabled={isLoadingRevealCode}
                            >
                                {isLoadingRevealCode && <Loader/>}
                                Reveal code
                                <InfoIcon size={15} className={"ml-2"}/>
                            </Button>
                        }
                    </>
                }
            </CardFooter>
        </Card>
    );
};

export default BurnedVouchers;
