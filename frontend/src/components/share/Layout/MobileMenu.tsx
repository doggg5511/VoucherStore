import {Link, useLocation} from "react-router-dom";
import globalStore from "@/store/globalStore.ts";
import {Sheet, SheetContent, SheetHeader, SheetTitle} from "@/components/ui/sheet.tsx";
import {CustomConnectButton} from "@/components/share/ConnectButton.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {CircleEqual} from "lucide-react";
import {Separator} from "@/components/ui/separator.tsx";
import {Button} from "@/components/ui/button.tsx";

import Loader from "@/components/share/Loader.tsx";
import {useAccount} from "wagmi";
import {NAVBAR_LINKS} from "@/lib/constants.ts";

type MobileMenuProps = {
    isOpenMobileMenu: boolean;
    setIsOpenMobileMenu: (x: boolean) => void;
}

export const MobileMenu = ({isOpenMobileMenu, setIsOpenMobileMenu,}: MobileMenuProps) => {
    const {pathname} = useLocation();
    const {jpyPrice, isLoadingGetStores, selectedStore} = globalStore();
    const {address} = useAccount()

    return (
        <Sheet open={isOpenMobileMenu} onOpenChange={setIsOpenMobileMenu}>
            <SheetContent className={"w-[90vw]"} side={"left"}>
                <SheetHeader className={"mb-4"}>
                    <SheetTitle>
                    </SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 sm:hidden">
                    <div className="items-center space-x-4 flex justify-center w-full">
                        <CustomConnectButton isMobile={true}/>
                    </div>
                </div>

                {jpyPrice !== -1 && (
                    <div className={'block md:hidden'}>
                        <Card className={"px-1 shadow bg-secondary "}>
                            <CardContent className={"m-0  p-1 px-2 py-2 text-sm flex justify-center"}>
                                <div className={" text-center flex justify-around w-full items-center"}>
                                    <Badge variant={'secondary'} className={'text-xl text-green-500'}>
                                        1 ¥
                                    </Badge>
                                    <CircleEqual/>
                                    <Badge className={'text-xl text-red-500'} variant={'secondary'}>
                                        {(1 / parseFloat(jpyPrice.toString())).toFixed(6)} $
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                        <Separator className={'m-0 p-0 my-5'}/>
                    </div>
                )}

                <div className={"flex flex-col gap-2"}>
                    <Button
                        variant={
                            pathname.includes("store") || pathname === "/"
                                ? "default"
                                : "outline"
                        }
                        asChild
                    >
                        {isLoadingGetStores
                            ? <div className={'flex items-center gap-2'}>
                                <Loader/>
                                All Stores
                            </div>
                            : <Link
                                onClick={() => setIsOpenMobileMenu(false)}
                                to={`/store/${selectedStore?.id ?? ''}`}
                            >
                                All Stores
                            </Link>
                        }
                    </Button>

                    {NAVBAR_LINKS.map((link) => (
                        <Button
                            key={link.path}
                            variant={pathname.includes(link.path) ? "default" : "outline"}
                            asChild
                        >
                            <Link
                                to={`/${link.path}`}
                                onClick={() => setIsOpenMobileMenu(false)}
                            >
                                {link.label}
                            </Link>
                        </Button>
                    ))}

                    {address &&
                        <Button
                            className={""}
                            asChild={!isLoadingGetStores}
                            variant={
                                pathname.includes("profile")
                                    ? "default"
                                    : "outline"
                            }
                        >
                            {isLoadingGetStores
                                ? <div className={'flex items-center gap-2'}>
                                    <Loader/>Profile
                                </div>
                                : <Link to={`/profile/${address}`}>Profile</Link>
                            }
                        </Button>
                    }
                </div>
            </SheetContent>
        </Sheet>
    );
};