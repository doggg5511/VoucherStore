import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {ClockIcon, ImageIcon, StoreIcon} from "lucide-react";
import {StoreType, VoucherType} from "@/types";
import React, {useEffect, useState} from "react";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {jocClientRead} from "@/lib/wagmi.ts";
import {STORE_VOUCHERS} from "@/lib/contracts.ts";
import {STORE_VOUCHERS_ABI} from "@/lib/abis/STORE_VOUCHERS_ABI.ts";
import axios from "axios";
import Loader from "@/components/share/Loader.tsx";
import {PROXY} from "@/lib/constants.ts";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {timestampToDate} from "@/lib/functions.ts";

export type ProfileDescriptionModalProps = {
    isOpenDetailsModal: boolean;
    selectedVoucher: VoucherType | null;
    setSelectedVoucher: (voucher: any) => void;
    setIsOpenDetailsModal: (status: boolean) => void;
};


export const ProfileDescriptionModal = ({
                                            isOpenDetailsModal,
                                            selectedVoucher,
                                            setSelectedVoucher,
                                            setIsOpenDetailsModal,
                                        }: ProfileDescriptionModalProps) => {
    const [isLoadingStoreDetails, setIsLoadingStoreDetails] = useState(false)
    const [storeDetails, setStoreDetails] = useState<StoreType | null>(null)

    const getStoreDetails = async () => {
        try {
            setIsLoadingStoreDetails(true)
            const eStore: any = await jocClientRead.readContract({
                address: STORE_VOUCHERS,
                abi: STORE_VOUCHERS_ABI,
                functionName: 'stores',
                args: [parseInt(selectedVoucher!.storeId!.toString())]
            })
            const {data} = await axios.get(`${PROXY}${eStore[3]}`)

            setStoreDetails({
                id: parseInt(eStore[0]),
                owner: eStore[1],
                title: eStore[2],
                imgUrl: `${PROXY}${data?.imgUrl}`,
            })
            setIsLoadingStoreDetails(false)
        } catch (e) {
            console.log(e)
            setIsLoadingStoreDetails(false)
        }
    };

    useEffect(() => {
        if (selectedVoucher) {
            getStoreDetails()
        }
    }, [selectedVoucher]);

    return (
        <Dialog
            open={isOpenDetailsModal && !!selectedVoucher}
            onOpenChange={(e) => {
                if (!e) setSelectedVoucher(null);
                setIsOpenDetailsModal(e);
            }}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    {selectedVoucher?.id !== undefined &&
                        <DialogTitle className={'p-0 m-1'}>Voucher
                            #{parseInt(selectedVoucher?.id.toString())}</DialogTitle>
                    }
                    <DialogDescription>{selectedVoucher?.description}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div
                        className={
                            "flex h-40 items-center justify-center rounded-md bg-secondary"
                        }
                    >
                        {selectedVoucher?.imgUrl !== "" ? (
                            <img
                                src={selectedVoucher?.imgUrl}
                                alt=""
                                className={
                                    "h-full w-full rounded-md object-cover object-center"
                                }
                            />
                        ) : (
                            <ImageIcon className={" "} size={30}/>
                        )}
                    </div>
                </div>

                <Card>
                    <CardContent className={'m-0 p-1 px-2'}>
                        {selectedVoucher?.storeId !== undefined &&
                            <div className={'flex justify-between w-full  items-center'}>
                                <div className={'flex items-center gap-2'}>
                                    {isLoadingStoreDetails
                                        ? <Loader className={'p-0 m-0'}/>
                                        : storeDetails?.imgUrl !== "" ? (
                                            <img
                                                src={selectedVoucher?.imgUrl}
                                                alt=""
                                                className={
                                                    "h-5 w-5 rounded-md object-cover object-center"
                                                }
                                            />
                                        ) : (
                                            <StoreIcon className={
                                                "h-5 w-5 rounded-md object-cover object-center"
                                            }/>
                                        )
                                    }
                                    Store:
                                </div>
                                {isLoadingStoreDetails
                                    ? <Loader/>
                                    : <div className={'text-muted-foreground'}>
                                        {storeDetails?.title}
                                    </div>
                                }
                            </div>
                        }

                        <div className={'flex justify-between w-full  items-center'}>
                            <div className={'flex items-center gap-2'}>
                                <ClockIcon size={20}/> Expire:
                            </div>
                            {(new Date().getTime()) > (new Date(selectedVoucher?.expiredTimestamp as any).getTime())
                                ? <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge variant={'destructive'} className={'flex items-center gap-2'}>
                                                Expired
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{timestampToDate(parseInt(selectedVoucher?.expiredTimestamp as any), 'FULL')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                : <div className={'text-muted-foreground'}>
                                    {timestampToDate(parseInt(selectedVoucher?.expiredTimestamp as any), 'FULL')}
                                </div>
                            }
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
};