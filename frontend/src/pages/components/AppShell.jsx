export default function AppShell({children}){

 return(

  <div className="min-h-screen bg-gradient-to-br from-[#e6f7f5] to-[#f8fafc]">

   <div className="flex min-h-screen">

    {children}

   </div>

  </div>

 );

}