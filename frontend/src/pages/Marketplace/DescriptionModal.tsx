import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {ClockIcon, ImageIcon, ListCheckIcon} from "lucide-react";
import {BuyModule} from "@/pages/Marketplace/BuyModule.tsx";

import {VoucherPackType} from "@/types";
import {timestampToDate} from "@/lib/functions.ts";
import {Alert} from "@/components/ui/alert.tsx";

export type DescriptionModalProps = {
    isOpenDetailsModal: boolean;
    selectedVoucher: VoucherPackType | null;
    setSelectedVoucher: (voucher: any) => void;
    setIsOpenDetailsModal: (status: boolean) => void;
};

export const DescriptionModal = ({
                                     isOpenDetailsModal,
                                     selectedVoucher,
                                     setSelectedVoucher,
                                     setIsOpenDetailsModal,
                                 }: DescriptionModalProps) => {
    return (
        <Dialog
            open={isOpenDetailsModal && !!selectedVoucher}
            onOpenChange={(e) => {
                if (!e) setSelectedVoucher(null);
                setIsOpenDetailsModal(e);
            }}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{selectedVoucher?.title}</DialogTitle>
                    <DialogDescription>{selectedVoucher?.description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-1">
                    <div
                        className={
                            "flex h-40 items-center justify-center rounded-md bg-secondary"
                        }
                    >
                        {selectedVoucher?.imgUrl !== "" ? (
                            <img
                                src={selectedVoucher?.imgUrl}
                                alt=""
                                className={
                                    "h-full w-full rounded-md object-cover object-center"
                                }
                            />
                        ) : (
                            <ImageIcon className={" "} size={30}/>
                        )}
                    </div>
                </div>
                {selectedVoucher &&
                    <Alert className={'p-2 m-0'}>
                        <div className={' flex flex-wrap'}>
                            <div className={'flex justify-between items-center w-full flex-wrap'}>
                                <div className={'font-semibold flex items-center gap-2'}>
                                    <ListCheckIcon size={15}/> Vouchers left:
                                </div>
                                <div className={'text-muted-foreground'}>
                                    {selectedVoucher?.maxSupply - selectedVoucher?.totalSoldCount}/{selectedVoucher?.maxSupply}
                                </div>
                            </div>

                            <div className={'flex justify-between items-center w-full flex-wrap'}>
                                <div className={'font-semibold flex gap-2 items-center'}>
                                    <ClockIcon size={15}/> Expire:
                                </div>
                                <div className={'text-muted-foreground'}>
                                    {timestampToDate(selectedVoucher?.expirationTimestamp, 'FULL')}
                                </div>
                            </div>
                        </div>
                    </Alert>
                }

                {selectedVoucher && selectedVoucher.totalSoldCount < selectedVoucher.maxSupply && (new Date().getTime()) < (new Date(selectedVoucher?.expirationTimestamp).getTime()) &&
                    <DialogFooter>
                        <BuyModule voucher={selectedVoucher}/>
                    </DialogFooter>
                }
            </DialogContent>
        </Dialog>
    );
};