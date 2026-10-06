import { Menu } from "lucide-react";

export default function Header({ openSidebar }) {

 const user = JSON.parse(localStorage.getItem("user"));

 return (

  <header className="h-16  flex items-center justify-between px-4 md:px-8">

   {/* left */}

   <div className="flex items-center gap-3">

    {/* mobile hamburger */}

    <button

     onClick={openSidebar}

     className="md:hidden border rounded-lg p-2 hover:bg-slate-100"

    >

     <Menu size={18} />

    </button>



    {/* logo text */}

    <h1 className="text-base font-semibold text-slate-800">

     Dhruwraj Management System

    </h1>

   </div>



   {/* right */}

   <div className="flex items-center gap-3">

    <div className="text-right hidden sm:block">

     <p className="text-sm font-medium text-slate-700">

      {user?.name}

     </p>

     <p className="text-xs text-slate-400">

      Admin

     </p>

    </div>



    {/* <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold">

     {user?.name?.charAt(0)}

    </div> */}

    <div className="w-9 h-9 rounded-full  flex items-center justify-center overflow-hidden">
  <img 
    src="/brandicon.png" 
    alt= {user?.name?.charAt(0)}
    className="w-full h-full object-cover" 
  />
</div>

   </div>

  </header>

 );

}