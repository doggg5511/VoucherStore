import {ConnectButton} from "@rainbow-me/rainbowkit";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";

export const CustomConnectButton = ({isMobile = false}: { isMobile?: boolean }) => {
    return (
        <ConnectButton.Custom>
            {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
              }) => {
                const ready = mounted && authenticationStatus !== "loading";
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus || authenticationStatus === "authenticated");

                return (
                    <div
                        className={cn("w-full")}
                        {...(!ready && {
                            "aria-hidden": true,
                            style: {
                                opacity: 0,
                                pointerEvents: "none",
                                userSelect: "none",
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <Button
                                        className={"w-full"}
                                        size={"sm"}
                                        onClick={openConnectModal}
                                        type="button"
                                    >
                                        Connect Wallet
                                    </Button>
                                );
                            }
                            if (chain.unsupported) {
                                return (
                                    <Button
                                        className={"w-full"}
                                        size={"sm"}
                                        onClick={openChainModal}
                                        type="button"
                                    >
                                        Wrong network
                                    </Button>
                                );
                            }
                            return (
                                <div className={cn("flex w-full gap-2", {"flex-col": isMobile})}>
                                    <Button
                                        className={"flex w-full items-center align-middle"}
                                        size={"sm"}
                                        onClick={openChainModal}
                                        type="button"
                                    >
                                        {chain.hasIcon && (
                                            <div
                                                className={
                                                    "mr-[4px] h-[12px] w-[12px] overflow-hidden rounded-[999px]"
                                                }
                                                style={{background: chain.iconBackground}}
                                            >
                                                {chain.iconUrl && (
                                                    <img
                                                        alt={chain.name ?? "Chain icon"}
                                                        src={chain.iconUrl}
                                                        className={'w-[12px] h-[12px]'}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {chain.name}
                                    </Button>
                                    <Button
                                        className={"w-full"}
                                        size={"sm"}
                                        onClick={openAccountModal}
                                        type="button"
                                    >
                                        {account.displayName}
                                        {account.displayBalance
                                            ? ` (${account.displayBalance})`
                                            : ""}
                                    </Button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};
