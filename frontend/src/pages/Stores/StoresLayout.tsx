import React, {useEffect} from "react";
import {Outlet, useNavigate, useParams} from "react-router-dom";
import {StoresSidebar} from "@/pages/Stores/StoresSidebar.tsx";
import globalStore from "@/store/globalStore.ts";
import Loader from "@/components/share/Loader.tsx";

const StoresLayout = () => {
    const navigate = useNavigate()
    const {stores, isLoadingGetStores, setSelectedStore} = globalStore()
    const {storeId} = useParams()

    useEffect(() => {
        if (stores.length !== 0) {
            if (storeId == undefined || storeId == null) {
                navigate(`/store/${stores[0].id}`)
                setSelectedStore(stores[0])
            } else {
                navigate(`/store/${storeId}`)
                setSelectedStore(stores.find(store => parseInt(store.id.toString()) === parseInt(storeId)) ?? stores[0])
            }
        }
    }, [stores, storeId]);

    return (
        <div className="grid lg:grid-cols-5 gap-2">
            <StoresSidebar className=" hidden lg:block"/>

            <div className="col-span-3 lg:col-span-4 ">
                {isLoadingGetStores
                    ? <Loader/>
                    : <Outlet/>
                }
            </div>
        </div>
    );
};

export default StoresLayout;