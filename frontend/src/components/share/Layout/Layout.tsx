import {Outlet} from "react-router-dom";
import Navbar from "@/components/share/Layout/Navbar.tsx";

const Layout = () => {
    return <div className={'pb-8'}>
        <Navbar/>
        <div className={"container mt-5 px-5 sm:px-10 md:px-12 xl:px-24 lg:px-24"}>
            <Outlet/>
        </div>
    </div>
};

export default Layout;
