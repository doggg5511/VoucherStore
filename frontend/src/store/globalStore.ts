import {create} from "zustand";
import {getJpyPrice} from "@/components/apis";
import {StoreType, VoucherPackType, VoucherType} from "@/types";

interface GlobalState {
    jpyPrice: number;
    vouchers: VoucherType[],
    isOpenStoreMobileMenu: boolean;
    isLoadingGetVoucherPacks: boolean;
    isLoadingGetStores: boolean;
    stores: StoreType[];
    voucherPacks: VoucherPackType[];
    selectedStore: StoreType | null;
    setStores: (x: StoreType[]) => void;
    setVouchers: (x: VoucherType[]) => void;
    setVoucherPacks: (x: VoucherPackType[]) => void;
    setIsOpenStoreMobileMenu: (isOpen: boolean) => void;
    setSelectedStore: (x: StoreType) => void;
    setJpyPrice: (price: number) => void;
    setIsLoadingGetVoucherPacks: (isLoading: boolean) => void;
    setIsLoadingGetStores: (isLoading: boolean) => void;
    fetchJpyPrice: () => void;
}

const globalStore = create<GlobalState>((set) => ({
    jpyPrice: -1,
    stores: [],
    vouchers: [],
    voucherPacks: [],
    isOpenStoreMobileMenu: false,
    selectedStore: null,
    isLoadingGetVoucherPacks: false,
    isLoadingGetStores: false,
    setIsOpenStoreMobileMenu: (isOpen) => {
        set(() => ({isOpenStoreMobileMenu: isOpen}));
    },
    setJpyPrice: (price) => {
        set(() => ({jpyPrice: price}));
    },
    setIsLoadingGetStores: (isLoading) => {
        set(() => ({isLoadingGetStores: isLoading}));
    },
    setIsLoadingGetVoucherPacks: (isLoading) => {
        set(() => ({isLoadingGetVoucherPacks: isLoading}));
    },
    setStores: (s) => {
        set(() => ({
            stores: s,
            selectedStore: s[0]
        }));
    },
    setVoucherPacks: (v) => {
        set(() => ({voucherPacks: v}));
    },
    setVouchers: (v) => {
        set(() => ({vouchers: v}));
    },
    setSelectedStore: (s) => {
        set(() => ({selectedStore: s}));
    },
    fetchJpyPrice: async () => {
        const price = await getJpyPrice();
        set(() => ({jpyPrice: price?.quote?.JPY?.price}));
    },
}));

export default globalStore;
