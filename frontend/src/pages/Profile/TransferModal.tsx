import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {VoucherType} from "@/types";
import React, {useState} from "react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {SendIcon} from "lucide-react";
import Loader from "@/components/share/Loader.tsx";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {jocClientRead, jocConfig, jpaWalletClient} from "@/lib/wagmi.ts";
import {STORE_VOUCHERS} from "@/lib/contracts.ts";
import {STORE_VOUCHERS_ABI} from "@/lib/abis/STORE_VOUCHERS_ABI.ts";
import {toast} from "sonner";
import {useAccount} from "wagmi";
import {isAddress} from "viem";
import {cn} from "@/lib/utils.ts";

export type TransferModalProps = {
    isOpenTransferModal: boolean;
    setIsOpenTransferModal: (status: boolean) => void;
    selectedVoucher: VoucherType | null;
    setSelectedVoucher: (voucher: any) => void;
    getBalance: () => Promise<any>;
};

export const TransferModal = ({
                                  isOpenTransferModal,
                                  setIsOpenTransferModal,
                                  selectedVoucher,
                                  setSelectedVoucher,
                                  getBalance,
                              }: TransferModalProps) => {
    const [sendAddress, setSendAddress] = useState('')
    const [isLoadingSendVoucher, setIsLoadingSendVoucher] = useState(false)
    const {address, chainId} = useAccount()

    const handleTransfer = async () => {
        if (chainId !== jocConfig.id) {
            toast.error('Please connect to JOC Testnet!')
            return
        }

        if (!isAddress(sendAddress)) {
            toast.error('Wrong address!')
            return
        }

        if (address === sendAddress) {
            toast.error('Cannot send to yourself!')
            return
        }

        try {
            setIsLoadingSendVoucher(true);
            const {request} = await jocClientRead.simulateContract({
                address: STORE_VOUCHERS as any,
                abi: STORE_VOUCHERS_ABI,
                functionName: 'safeTransferFrom',
                args: [address, sendAddress, selectedVoucher?.id],
                account: address,
            })
            const hash = await jpaWalletClient!.writeContract(request)
            await jocClientRead.waitForTransactionReceipt({hash: hash})
            await getBalance()
            toast.success(hash);
            setIsLoadingSendVoucher(false);
        } catch (e) {
            console.log(e)
            toast.error("Error!");
            setIsLoadingSendVoucher(false);
        }
    };

    return (
        <Dialog
            open={isOpenTransferModal && !!selectedVoucher}
            onOpenChange={(e) => {
                if (!e) setSelectedVoucher(null);
                setIsOpenTransferModal(e);
            }}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Transfer voucher</DialogTitle>
                </DialogHeader>
                {selectedVoucher?.id !== undefined &&
                    <DialogTitle>
                        <Alert className={'p-1 m-1 flex justify-between w-full items-center'}>
                            <AlertTitle className={'p-0 m-1'}>Voucher
                                #{parseInt(selectedVoucher?.id.toString())}</AlertTitle>
                        </Alert>
                    </DialogTitle>
                }
                <div className="grid gap-4 pb-4">
                    <Input
                        className={cn(
                            "w-full",
                            {'border-destructive': (!isAddress(sendAddress) && sendAddress !== "") || address === sendAddress},
                            {'border-green-500': isAddress(sendAddress) && address !== sendAddress},
                        )}
                        placeholder="Address"
                        onChange={(e) => setSendAddress(e.target.value)}
                    />
                    <Button onClick={handleTransfer} disabled={isLoadingSendVoucher}
                            className={'flex items-center gap-2'}>
                        {isLoadingSendVoucher && <Loader/>}
                        Transfer
                        <SendIcon size={15}/>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};