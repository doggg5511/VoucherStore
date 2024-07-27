import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {BuyModule} from "@/pages/Marketplace/BuyModule.tsx";
import {VoucherPackType} from "@/types";

export type BuyModalProps = {
    isOpenBuyModal: boolean;
    setIsOpenBuyModal: (status: boolean) => void;
    selectedVoucher: VoucherPackType | null;
    setSelectedVoucher: (voucher: any) => void;
};

export const BuyModal = ({
                             isOpenBuyModal,
                             setIsOpenBuyModal,
                             selectedVoucher,
                             setSelectedVoucher,
                         }: BuyModalProps) => {
    return (
        <Dialog
            open={isOpenBuyModal && !!selectedVoucher}
            onOpenChange={(e) => {
                if (!e) setSelectedVoucher(null);
                setIsOpenBuyModal(e);
            }}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{selectedVoucher?.title}</DialogTitle>
                    <DialogDescription>Buy voucher</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <BuyModule voucher={selectedVoucher}/>
                </div>
            </DialogContent>
        </Dialog>
    );
};