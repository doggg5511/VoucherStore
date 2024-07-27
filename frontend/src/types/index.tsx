export type StoreType = {
    id: number;
    owner: string,
    imgUrl: string,
    title: string
};

export type VoucherPackType = {
    acceptOtherCoin: boolean
    coin: "USDT" | "JPY"
    description: string
    expirationTimestamp: number,
    id: number
    index: number
    imgUrl: string
    maxSupply: number
    price: number | string
    storeId: number,
    title: string
    totalSoldCount: number,
};

export type VoucherType = {
    id: number
    index: number
    storeId: number,
    packId: number,
    isBurned: boolean
    imgUrl: string
    description: string
    code: string,
    expiredTimestamp: string
};