import {Button} from "@/components/ui/button.tsx";
import React from "react";
import {CopyIcon, PlusCircleIcon, UserIcon} from "lucide-react";
import {Link, useParams} from "react-router-dom";
import globalStore from "@/store/globalStore.ts";
import {useAccount} from "wagmi";
import {NotUsedVouchersWrapper} from "@/pages/Profile/NotUsedVouchers.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger,} from "@/components/ui/tabs"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {BurnedVouchersWrapper} from "@/pages/Profile/BurnedVouchers.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {useClipboard} from "@/hooks/useClipboard.ts";
import {shortAddress} from "@/lib/functions.ts";

const Profile = () => {
    const {walletAddress} = useParams()
    const {address} = useAccount()
    const {selectedStore} = globalStore()
    const {copy} = useClipboard();

    return (
        <div className={"w-full"}>
            <div className={'flex w-full items-center justify-between mb-6 h-[40px]'}>
                <div className={'text-[25px] font-bold flex gap-4 items-center'}>
                    {selectedStore?.imgUrl && selectedStore?.imgUrl !== "" ? (
                        <img
                            src={selectedStore?.imgUrl}
                            alt=""
                            className={"h-7 w-7 rounded-md object-cover object-center"}
                        />
                    ) : (
                        <UserIcon className={"h-7 w-7"}/>
                    )}
                    {walletAddress &&
                        <Card className={'text-[15px]'}>
                            <CardContent className={'m-0 p-1 px-2'}>
                                {shortAddress(walletAddress)}
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button onClick={() => copy(walletAddress)} variant={'ghost'}
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
                </div>
            </div>

            <Tabs defaultValue="not-used-vouchers" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="not-used-vouchers">Vouchers not yet used</TabsTrigger>
                    <TabsTrigger value="burned-vouchers">Burned vouchers (for getting the code)</TabsTrigger>
                </TabsList>
                <TabsContent value="not-used-vouchers">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vouchers not yet used</CardTitle>
                            {/*<CardDescription>*/}
                            {/*    Not Used Vouchers*/}
                            {/*</CardDescription>*/}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <NotUsedVouchersWrapper/>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="burned-vouchers">
                    <Card>
                        <CardHeader>
                            <CardTitle>Burned vouchers (for getting the code)</CardTitle>
                            {/*<CardDescription>*/}
                            {/*    Burned Vouchers*/}
                            {/*</CardDescription>*/}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <BurnedVouchersWrapper/>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Profile;
