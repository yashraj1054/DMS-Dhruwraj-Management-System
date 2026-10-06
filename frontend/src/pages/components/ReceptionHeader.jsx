import { Menu } from "lucide-react";

export default function ReceptionHeader({ openSidebar }) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="h-16  flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={openSidebar}
          className="md:hidden border rounded-lg p-2"
        >
          <Menu size={18} />
        </button>

        <div>
          <h2 className="text-lg font-semibold">Reception Dashboard</h2>

          <p className="text-xs text-slate-400">Manage patients & billing</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.name}</p>

          <p className="text-xs text-slate-400">Reception</p>
        </div>

        <div className="w-9 h-9 rounded-full overflow-hidden  ">

 {user?.profileImage ? (

  <img

   src={`http://localhost:5001/uploads/${user.profileImage}`}

   alt="profile"

   className="w-full h-full object-cover"

  />

 ) : (

  <span className="text-teal-700 font-semibold">

   {user?.name?.charAt(0)}

  </span>

 )}

</div>
      </div>
    </div>
  );
}
