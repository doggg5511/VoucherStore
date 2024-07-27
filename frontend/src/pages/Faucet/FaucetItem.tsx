import {useState} from "react";
import {toast} from "sonner";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {WalletIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import Loader from "@/components/share/Loader.tsx";
import {useAccount} from "wagmi";
import {jocClientRead, jocConfig, jpaWalletClient} from "@/lib/wagmi.ts";
import {ERC_20_ABI} from "@/lib/abis/ERC_20_ABI.ts";

type FaucetItem = {
    tokenName: "USDT" | "JPY";
    imgSrc: string;
    tokenAddress: string;
}

export const FaucetItem = ({tokenName, imgSrc, tokenAddress}: FaucetItem) => {
    const [isLoading, setIsLoading] = useState(false);
    const {chainId} = useAccount()
    const {address} = useAccount()

    const handleClaimTokens = async () => {
        try {
            setIsLoading(true);
            const {request} = await jocClientRead.simulateContract({
                address: tokenAddress as any,
                abi: ERC_20_ABI,
                functionName: 'mint',
                args: [1000000000000000000000],
                account: address,
            })
            const hash = await jpaWalletClient!.writeContract(request)
            const transaction = await jocClientRead.waitForTransactionReceipt({hash: hash})
            toast.success("Successfully claimed!");
            setIsLoading(false);
        } catch (e) {
            console.log(e);
            toast.error("Error!");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
                <Avatar>
                    <AvatarImage src={imgSrc}/>
                    <AvatarFallback>
                        <WalletIcon size={15} className={"ml-1"}/>
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium leading-none">{tokenName}</p>
                    <p className="text-sm text-muted-foreground">1000 {tokenName}</p>
                </div>
            </div>
            <Button
                disabled={isLoading || (chainId !== jocConfig.id) || (address === undefined)}
                onClick={handleClaimTokens}
            >
                {isLoading && <Loader/>}
                Claim
            </Button>
        </div>
    );
};