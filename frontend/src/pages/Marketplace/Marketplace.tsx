import MarketplaceItem from "@/pages/Marketplace/MarketplaceItem.tsx";
import {Button} from "@/components/ui/button.tsx";
import React, {useEffect, useState} from "react";
import {PlusCircleIcon, StoreIcon} from "lucide-react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {DescriptionModal} from "@/pages/Marketplace/DescriptionModal.tsx";
import {BuyModal} from "@/pages/Marketplace/BuyModal.tsx";
import {VoucherPackType} from "@/types";
import globalStore from "@/store/globalStore.ts";
import {useAccount} from "wagmi";
import {jocClientRead} from "@/lib/wagmi.ts";
import {STORE_VOUCHERS} from "@/lib/contracts.ts";
import {STORE_VOUCHERS_ABI} from "@/lib/abis/STORE_VOUCHERS_ABI.ts";
import axios from "axios";
import {formatEther} from "viem";
import Loader from "@/components/share/Loader.tsx";
import {PROXY} from "@/lib/constants.ts";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";

const Marketplace = () => {
    const navigate = useNavigate()
    const {storeId} = useParams()
    const {address} = useAccount()
    const {selectedStore, setIsOpenStoreMobileMenu, isOpenStoreMobileMenu, isLoadingGetVoucherPacks, setIsLoadingGetVoucherPacks, voucherPacks, setVoucherPacks} = globalStore()

    const [isOpenDetailsModal, setIsOpenDetailsModal] = useState(false);
    const [isOpenBuyModal, setIsOpenBuyModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<VoucherPackType | null>(null);

    const checkIfStoreExist = async () => {
        const eStore: any = await jocClientRead.readContract({
            address: STORE_VOUCHERS,
            abi: STORE_VOUCHERS_ABI,
            functionName: 'stores',
            args: [storeId]
        })
        if (eStore[1] === "0x0000000000000000000000000000000000000000") {
            navigate(`/store`)
        }
    }

    const getVouchers = async () => {
        try {
            setIsLoadingGetVoucherPacks(true)

            const vouchersCounter: any = await jocClientRead.readContract({
                address: STORE_VOUCHERS,
                abi: STORE_VOUCHERS_ABI,
                functionName: 'voucherPackCount',
                args: [storeId]
            })

            let tempVouchersArr: VoucherPackType[] = []
            for (let i = 0; i < parseInt(vouchersCounter); i++) {
                const eStore: any = await jocClientRead.readContract({
                    address: STORE_VOUCHERS,
                    abi: STORE_VOUCHERS_ABI,
                    functionName: 'voucherPacks',
                    args: [storeId, i]
                })
                const {data} = await axios.get(`${PROXY}${eStore[9]}`)
                tempVouchersArr.push({
                    index: i,
                    id: parseInt(eStore[0]),
                    storeId: parseInt(eStore[1]),
                    title: eStore[2],
                    price: formatEther(eStore[3]),
                    coin: eStore[4],
                    expirationTimestamp: parseInt(eStore[5]),
                    maxSupply: parseInt(eStore[6]),
                    totalSoldCount: parseInt(eStore[7]),
                    acceptOtherCoin: eStore[8],
                    imgUrl: `${PROXY}${data?.imgUrl}`,
                    description: data?.description
                })
            }
            setVoucherPacks([])
            if (storeId)
                setVoucherPacks(tempVouchersArr.filter(item => item.storeId === parseInt(storeId)))
            tempVouchersArr = []
            setIsLoadingGetVoucherPacks(false)
        } catch (e) {
            setIsLoadingGetVoucherPacks(false)
            console.log(e)
        }
    }

    useEffect(() => {
        if (storeId) getVouchers()
    }, [selectedStore, storeId]);

    useEffect(() => {
        checkIfStoreExist()
    }, [storeId]);

    return (
        <div className={"w-full"}>
            <div className={'flex w-full items-center  mb-6 h-min-[40px] gap-2 justify-between flex-wrap'}>
                <div className={'text-[25px] font-bold flex gap-4 items-center'}>
                    {selectedStore?.imgUrl && selectedStore?.imgUrl !== "" ? (
                        <img
                            src={selectedStore?.imgUrl}
                            alt=""
                            className={"h-7 w-7 rounded-md object-cover object-center"}
                        />
                    ) : (
                        <StoreIcon className={"h-7 w-7"}/>
                    )}
                    {selectedStore &&
                        <div>{selectedStore?.title}</div>
                    }
                </div>
                <div className={'flex gap-4 items-center'}>
                    {selectedStore && selectedStore?.owner === address
                        ? <Button asChild variant={"secondary"}>
                            <Link to={`/store/${selectedStore?.id}/create-item`}>
                                <PlusCircleIcon size={15} className={"mr-2"}/>
                                New voucher
                            </Link>
                        </Button>
                        : <div></div>
                    }
                    <div className={'block lg:hidden'}>
                        <Button className={'flex gap-2 items-center'} onClick={() => {
                            setIsOpenStoreMobileMenu(!isOpenStoreMobileMenu)
                        }}>
                            <StoreIcon size={15}/> Stores
                        </Button>
                    </div>
                </div>
            </div>
            <DescriptionModal
                isOpenDetailsModal={isOpenDetailsModal}
                setIsOpenDetailsModal={setIsOpenDetailsModal}
                selectedVoucher={selectedVoucher}
                setSelectedVoucher={setSelectedVoucher}
            />
            <BuyModal
                isOpenBuyModal={isOpenBuyModal}
                setSelectedVoucher={setSelectedVoucher}
                selectedVoucher={selectedVoucher}
                setIsOpenBuyModal={setIsOpenBuyModal}
            />

            {isLoadingGetVoucherPacks
                ? <Loader/>
                : voucherPacks.length === 0
                    ? <Alert className={'w-full'}>
                        <AlertTitle className={'w-full'}>
                            No vouchers
                        </AlertTitle>
                    </Alert>
                    : <div
                        className={
                            "w-full grid grid-cols-1 gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        }
                    >
                        {voucherPacks.map((voucher) => (
                            <MarketplaceItem
                                key={voucher.id + '-' + voucher.storeId}
                                setIsOpenBuyModal={setIsOpenBuyModal}
                                item={voucher}
                                setSelectedVoucher={setSelectedVoucher}
                                setIsOpenDetailsModal={setIsOpenDetailsModal}
                            />

                        ))}
                    </div>
            }
        </div>
    );
};

export default Marketplace;
