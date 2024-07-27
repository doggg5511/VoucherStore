import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import Layout from "@/components/share/Layout/Layout.tsx";
import CreateMarketItem from "@/pages/Create/CreateMarketItem.tsx";
import Marketplace from "@/pages/Marketplace/Marketplace.tsx";
import Bridge from "@/pages/Bridge/Bridge.tsx";
import Faucet from "@/pages/Faucet/Faucet.tsx";
import Swap from "@/pages/Swap/Swap.tsx";
import StoresLayout from "@/pages/Stores/StoresLayout.tsx";
import CreateStore from "@/pages/Create/CreateStore.tsx";
import Profile from "@/pages/Profile/Profile.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>,
        children: [
            {
                path: "",
                element: <Navigate to={'/store'} replace/>
            },
            {
                path: "store",
                element: <StoresLayout/>,
                children: [
                    {
                        element: <Marketplace/>,
                        path: ''
                    }
                ]
            },
            {
                path: "store/:storeId",
                element: <StoresLayout/>,
                children: [
                    {
                        element: <Marketplace/>,
                        path: ''
                    }
                ]
            },
            {
                path: "store/:storeId/create-item",
                element: <CreateMarketItem/>
            },
            {
                path: "create-store",
                element: <CreateStore/>
            },
            {
                path: "bridge",
                element: <Bridge/>
            },
            {
                path: "faucet",
                element: <Faucet/>
            },
            {
                path: "swap",
                element: <Swap/>
            },
            {
                path: "profile/:walletAddress",
                element: <Profile/>
            },
        ],
    },
    {
        path: "*",
        element: <div>Page Not Found !</div>
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router}/>;
};

export default AppRouter;
