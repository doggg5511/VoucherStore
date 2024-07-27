import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card.tsx";
import {ClockIcon, ImageIcon, InfoIcon, ListCheckIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {useCallback} from "react";
import {Badge} from "@/components/ui/badge.tsx";
import {VoucherPackType} from "@/types";
import {timestampToDate} from "@/lib/functions.ts";
import globalStore from "@/store/globalStore.ts";
import {Alert} from "@/components/ui/alert.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Tokens} from "@/lib/constants.ts";

type MarketplaceItemProps = {
    item: VoucherPackType;
    setIsOpenBuyModal: (status: boolean) => void;
    setSelectedVoucher: (voucher: any) => void;
    setIsOpenDetailsModal: (status: boolean) => void;
};

const MarketplaceItem = ({
                             item,
                             setIsOpenBuyModal,
                             setSelectedVoucher,
                             setIsOpenDetailsModal,
                         }: MarketplaceItemProps) => {
    const {jpyPrice} = globalStore()

    const handleOpenDescriptionModal = useCallback(() => {
        setIsOpenDetailsModal(true);
        setSelectedVoucher(item);
    }, []);

    const handleOpenBuyModal = useCallback(() => {
        setIsOpenBuyModal(true);
        setSelectedVoucher(item);
    }, []);

    return (
        <Card className={'bg-gray-100 dark:bg-gray-900 flex h-full justify-between flex-col'}>
            <CardHeader className={"pb-1"} style={{marginBottom: 'auto'}}>
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
                <CardTitle className={"text-md text-[20px]"}>
                    {item.title}
                </CardTitle>
            </CardHeader>
            <div>
                <CardContent>
                    <Alert className={'p-2 m-0'}>
                        <div className={' flex flex-wrap gap-2'}>
                            <div className={'flex justify-between items-center w-full flex-wrap'}>
                                <div className={'font-semibold flex items-center gap-2'}>
                                    <ListCheckIcon size={15}/> Vouchers left:
                                </div>
                                {item?.maxSupply === item?.totalSoldCount
                                    ? <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant={'destructive'} className={'flex items-center gap-2'}>
                                                    Sold out
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Total sold: {item?.maxSupply}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    : <div className={'text-muted-foreground'}>
                                        {item?.maxSupply - item?.totalSoldCount}/{item?.maxSupply}
                                    </div>
                                }
                            </div>

                            <div className={'flex justify-between items-center w-full flex-wrap'}>
                                <div className={'font-semibold flex gap-2 items-center'}>
                                    <ClockIcon size={15}/> Expire:
                                </div>
                                {(new Date().getTime()) > (new Date(item.expirationTimestamp).getTime())
                                    ? <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant={'destructive'} className={'flex items-center gap-2'}>
                                                    Expired
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{timestampToDate(item.expirationTimestamp, 'FULL')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    : <div className={'text-muted-foreground'}>
                                        {timestampToDate(item.expirationTimestamp, 'FULL')}
                                    </div>
                                }
                            </div>
                        </div>
                    </Alert>

                    <div className={'flex gap-2 justify-between w-full'}>
                        <Badge variant={'secondary'} className={'mt-2 text-[14px] flex gap-2'}>
                            <div>{parseFloat(item.price.toString()).toFixed(5)}</div>
                            <img
                                src={Tokens.find(token => item.coin === token.value.toUpperCase())?.imgSrc ?? ''}
                                alt={''}
                                className={'w-4 h-4'}
                            />
                        </Badge>

                        {item.acceptOtherCoin
                            ? <Badge variant={'secondary'} className={'mt-2 text-[14px] flex gap-2'}>
                                <div>{(item?.coin === "USDT" ? parseFloat(item.price.toString()) * parseFloat(jpyPrice.toString()) : parseFloat(item.price.toString()) / parseFloat(jpyPrice.toString())).toFixed(5)}</div>
                                <img
                                    src={Tokens.find(token => item.coin !== token.value.toUpperCase())?.imgSrc ?? ''}
                                    alt={''}
                                    className={'w-4 h-4'}
                                />
                            </Badge>
                            : <div></div>
                        }
                    </div>
                </CardContent>
                <CardFooter className={"flex gap-2"}>
                    <Button
                        variant={"secondary"}
                        onClick={handleOpenDescriptionModal}
                        className={"w-full"}
                        size={"sm"}
                    >
                        Details
                        <InfoIcon size={15} className={"ml-2"}/>
                    </Button>
                    {item && item.totalSoldCount < item.maxSupply && (new Date().getTime()) < (new Date(item?.expirationTimestamp).getTime()) &&
                        <Button
                            variant={"outline"}
                            onClick={handleOpenBuyModal}
                            className={"w-full"}
                            size={"sm"}
                        >
                            Buy
                            <div className={"ml-2"}>$</div>
                        </Button>
                    }
                </CardFooter>
            </div>
        </Card>
    );
};

export default MarketplaceItem;
