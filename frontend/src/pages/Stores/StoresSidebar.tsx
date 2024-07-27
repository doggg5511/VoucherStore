import {cn} from "@/lib/utils.ts"
import {Button} from "@/components/ui/button.tsx"
import {ScrollArea} from "@/components/ui/scroll-area.tsx"
import {Sheet, SheetContent, SheetHeader, SheetTitle,} from "@/components/ui/sheet.tsx"
import {LayoutGridIcon, PlusCircleIcon, StoreIcon} from "lucide-react";
import React, {useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import {jocClientRead} from "@/lib/wagmi.ts";
import {STORE_VOUCHERS} from "@/lib/contracts.ts";
import {STORE_VOUCHERS_ABI} from "@/lib/abis/STORE_VOUCHERS_ABI.ts";
import globalStore from "@/store/globalStore.ts";
import {StoreType} from "@/types";
import axios from "axios";
import {PROXY} from "@/lib/constants.ts";
import {Separator} from "@/components/ui/separator.tsx";
import {useAccount} from "wagmi";

const SidebarContent = ({stores}: { stores: StoreType[] }) => {
    const navigate = useNavigate()
    const {setSelectedStore, selectedStore, setIsOpenStoreMobileMenu} = globalStore()
    const {address} = useAccount()

    return <ScrollArea className="h-[300px] px-1">
        <div className="p-2 flex flex-col gap-4">
            <div className={'flex flex-col gap-2'}>
                {stores.map((item, i) => (
                    <Button
                        // disabled={isLoadingGetVouchers}
                        key={item.id}
                        variant={(selectedStore && (item.id === parseInt(selectedStore?.id?.toString()))) ? 'default' : "ghost"}
                        className={cn(
                            "w-full justify-start font-normal flex items-center gap-3",
                        )}
                        onClick={() => {
                            setIsOpenStoreMobileMenu(false)
                            navigate(`/store/${item.id}`)
                            setSelectedStore(item)
                        }}
                    >
                        {item?.imgUrl && item?.imgUrl !== "" ? (
                            <img
                                src={item?.imgUrl}
                                alt=""
                                className={"h-5 w-5 rounded-md object-cover object-center"}
                            />
                        ) : (
                            <StoreIcon className={"h-5 w-5"}/>
                        )}
                        <div>{item.title}</div>
                    </Button>
                ))}
            </div>
            {address &&
                <>
                    <Separator/>
                    <Button size={'sm'} asChild variant={"secondary"}>
                        <Link to={"/create-store"}>
                            <PlusCircleIcon size={15} className={"mr-2"}/> New store
                        </Link>
                    </Button>
                </>
            }
        </div>
    </ScrollArea>
}

export function StoresSidebar({className}: { className: string }) {
    const {
        stores,
        setStores,
        setIsLoadingGetStores,
        isOpenStoreMobileMenu,
        setIsOpenStoreMobileMenu
    } = globalStore()

    const getStores = async () => {
        try {
            setIsLoadingGetStores(true)
            const eCounter: any = await jocClientRead.readContract({
                address: STORE_VOUCHERS,
                abi: STORE_VOUCHERS_ABI,
                functionName: 'storeIdCounter',
            })

            const tempStoresArr = []
            for (let i = 0; i < parseInt(eCounter); i++) {
                const eStore: any = await jocClientRead.readContract({
                    address: STORE_VOUCHERS,
                    abi: STORE_VOUCHERS_ABI,
                    functionName: 'stores',
                    args: [i]
                })
                const {data} = await axios.get(`${PROXY}${eStore[3]}`)

                tempStoresArr.push({
                    id: parseInt(eStore[0]),
                    owner: eStore[1],
                    title: eStore[2],
                    imgUrl: `${PROXY}${data?.imgUrl}`,
                })
            }

            setStores(tempStoresArr)
            setIsLoadingGetStores(false)
        } catch (e) {
            setIsLoadingGetStores(false)
            console.log(e)
        }
    }

    useEffect(() => {
        getStores()
    }, []);

    return (
        <>
            <Sheet onOpenChange={setIsOpenStoreMobileMenu} open={isOpenStoreMobileMenu}>
                <SheetContent className={'px-0 mx-0'}>
                    <SheetHeader className={'px-4'}>
                        <SheetTitle>
                            Stores
                        </SheetTitle>
                    </SheetHeader>
                    <SidebarContent stores={stores}/>
                </SheetContent>
            </Sheet>
            <div className={cn("pb-12", className)}>
                <div className="py-2 h-full">
                    <div className={'flex items-center justify-between mb-2'}>
                        <h2 className="relative  text-lg px-7 font-semibold tracking-tight flex items-center gap-2">
                            <div><LayoutGridIcon/></div>
                            <div>Stores</div>
                        </h2>
                    </div>
                    <SidebarContent stores={stores}/>
                </div>
            </div>
        </>
    )
}