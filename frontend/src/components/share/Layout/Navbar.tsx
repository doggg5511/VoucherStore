import {useEffect, useState} from "react";
import {CustomConnectButton} from "@/components/share/ConnectButton.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CircleEqual, MenuIcon} from "lucide-react";
import {ThemeToggle} from "@/components/share/ThemeToggle.tsx";
import {Link, useLocation} from "react-router-dom";
import globalStore from "@/store/globalStore.ts";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {MobileMenu} from "@/components/share/Layout/MobileMenu.tsx";
import Loader from "@/components/share/Loader.tsx";
import {useAccount} from "wagmi";
import {NAVBAR_LINKS} from "@/lib/constants.ts";

const Navbar = () => {
    const {pathname} = useLocation();
    const {address} = useAccount()
    const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
    const {fetchJpyPrice, jpyPrice, selectedStore, isLoadingGetStores} = globalStore();

    useEffect(() => {
        fetchJpyPrice();
    }, []);

    return (
        <>
            <MobileMenu
                isOpenMobileMenu={isOpenMobileMenu}
                setIsOpenMobileMenu={setIsOpenMobileMenu}
            />
            <div
                className="sticky left-0 right-0 top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div
                    className="lg:px-30 container flex h-16 items-center gap-1 lg:gap-2 px-5 sm:px-10 md:px-5 lg:px-10">
                    <Button
                        className={"m-0 flex h-[40px] w-[40px] p-0 lg:hidden"}
                        onClick={() => setIsOpenMobileMenu(true)}
                        variant="outline"
                    >
                        <MenuIcon size={20}/>
                    </Button>

                    <div>
                        <ThemeToggle/>
                    </div>

                    <Button
                        className={"hidden lg:block"}
                        variant={
                            pathname.includes("store") || pathname === "/"
                                ? "default"
                                : "outline"
                        }
                        asChild={!isLoadingGetStores}
                    >
                        {isLoadingGetStores
                            ? <div className={'flex items-center gap-2'}>
                                <Loader/>
                                All Stores
                            </div>
                            : <Link to={`/store/${selectedStore?.id ?? ''}`}>All Stores</Link>
                        }
                    </Button>

                    {NAVBAR_LINKS.map((link) => (
                        <Button
                            key={link.path}
                            className={"hidden lg:block"}
                            variant={pathname.includes(link.path) ? "default" : "outline"}
                            asChild
                        >
                            <Link to={`/${link.path}`}>{link.label}</Link>
                        </Button>
                    ))}

                    {address &&
                        <Button
                            className={"hidden lg:block"}
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

                    <div className="ml-auto flex w-max items-center space-x-4">
                        {jpyPrice !== -1 && (
                            <Card className={"px-1 shadow hidden md:block bg-secondary"}>
                                <CardContent className={"m-0  p-1 px-2 text-sm"}>
                                    <div className={"w-max text-center gap-2 flex items-center justify-center"}>
                                        <div className={'text-red-500 font-bold'}>
                                            1 ¥
                                        </div>
                                        <CircleEqual size={15}/>
                                        <div className={'text-green-500 font-bold'}>
                                            {(1 / parseFloat(jpyPrice.toString())).toFixed(6)} $
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        <div className={'hidden sm:block'}>
                            <CustomConnectButton/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
