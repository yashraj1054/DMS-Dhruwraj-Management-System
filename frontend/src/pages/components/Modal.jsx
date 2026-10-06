export default function Modal({

 title,
 children,
 onClose

}){

 return(

  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">




   <div

    className="

    bg-white

    w-full
    max-w-3xl

    max-h-[90vh]

    overflow-y-auto

    rounded-xl

    shadow-xl

    border

    "

   >




    {/* header */}

    <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">




     <h2 className="font-semibold text-lg">

      {title}

     </h2>




     <button

      onClick={onClose}

      className="text-slate-400 hover:text-slate-700 text-xl"

     >

      ✕

     </button>




    </div>




    {/* body */}

    <div className="p-6">

     {children}

    </div>




   </div>




  </div>

 );

}