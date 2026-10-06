import { useState } from "react";

import Sidebar from "../pages/components/Sidebar";
import Header from "../pages/components/Header";

import { Outlet } from "react-router-dom";

export default function AdminLayout(){

 const [sidebarOpen,setSidebarOpen] = useState(false);

 return(

  <div className="flex min-h-screen bg-[#f6fbfb]">

   <Sidebar
    open={sidebarOpen}
    setOpen={setSidebarOpen}
   />



   <div className="flex-1 flex flex-col">

    <Header
     openSidebar={()=>setSidebarOpen(true)}
    />



    <main className="p-4 md:p-8">

     <Outlet/>

    </main>

   </div>

  </div>

 );
}