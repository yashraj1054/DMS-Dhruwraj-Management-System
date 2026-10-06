import { useState } from "react";

import ReceptionSidebar from "../pages/components/ReceptionSidebar";
import ReceptionHeader from "../pages/components/ReceptionHeader";

import { Outlet } from "react-router-dom";

export default function ReceptionLayout(){

 const [open,setOpen]=useState(false);

 return(

  <div className="flex min-h-screen bg-[#f6fbfb]">

   <ReceptionSidebar

    open={open}
    setOpen={setOpen}

   />



   <div className="flex-1">

    <ReceptionHeader

     openSidebar={()=>setOpen(true)}

    />



    <main className="p-4 md:p-8">

     <Outlet/>

    </main>

   </div>

  </div>

 );

}