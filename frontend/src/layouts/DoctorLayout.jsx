import { useState } from "react";
import { Outlet } from "react-router-dom";
import DoctorSidebar from "../pages/components/DoctorSidebar";
import DoctorHeader from "../pages/components/DoctorHeader";
 

export default function DoctorLayout(){

    const [open,setOpen]=useState(false);

 return(

  <div className="flex min-h-screen bg-[#f6fbfb]">
  
     <DoctorSidebar
  
      open={open}
      setOpen={setOpen}
  
     />
  
  
  
     <div className="flex-1">
  
      <DoctorHeader
  
       openSidebar={()=>setOpen(true)}
  
      />
  
  
  
      <main className="p-4 md:p-8">
  
       <Outlet/>
  
      </main>
  
     </div>
  
    </div>

 );

}