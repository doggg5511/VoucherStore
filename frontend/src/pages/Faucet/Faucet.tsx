import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {FaucetItem} from "@/pages/Faucet/FaucetItem.tsx";
import {useAccount} from "wagmi";
import {jocConfig} from "@/lib/wagmi.ts";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {OctagonAlert} from "lucide-react";
import {Tokens} from "@/lib/constants.ts";

const Faucet = () => {
    const {chainId, address} = useAccount()

    return (
        <div className={"mb-10 px-1 sm:px-5 md:px-12 lg:px-36 xl:px-52"}>
            {address !== undefined && chainId !== jocConfig.id &&
                <Alert className={'mb-5'}>
                    <AlertTitle className={'text-red-500 font-bold flex gap-2 items-center'}>
                        <OctagonAlert/> Please connect to JOC Testnet
                    </AlertTitle>
                </Alert>
            }

            {address === undefined &&
                <Alert className={'mb-5'}>
                    <AlertTitle className={'text-red-500 font-bold flex gap-2 items-center'}>
                        <OctagonAlert/> Please connect Metamask
                    </AlertTitle>
                </Alert>
            }

            <Card className={'bg-gray-100 dark:bg-gray-900'}>
                <CardHeader>
                    <CardTitle>Faucet</CardTitle>
                    <CardDescription>Claim token</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    {Tokens.map((token, index) =>
                        <>
                            <FaucetItem
                                tokenName={token.label}
                                imgSrc={token.imgSrc}
                                tokenAddress={token.address}
                            />
                            {Tokens.length - 1 !== index &&
                                <Separator/>
                            }
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Faucet;
