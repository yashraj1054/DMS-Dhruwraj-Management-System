import { NavLink } from "react-router-dom";

import { Users, Wallet, User, LogOut ,  } from "lucide-react";

export default function DoctorSidebar({ open, setOpen }) {
  const logout = () => {
    localStorage.clear();

    window.location = "/";
  };

  const menu = [
    {
      name: "Appointments",
      path: "/doctor",
      icon: Users,
    },


    {
      name: "Profile",
      path: "/doctor/profile",
      icon: User,
    },
  ];

  return (
    <>
      {/* mobile overlay */}

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        />
      )}

      <aside
        className={`

     fixed md:sticky
    z-50
    top-0 left-0

    h-screen
    w-64

    bg-white
    border-r

    overflow-hidden

    px-6 py-6

    transform transition-transform duration-300

     ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}

    `}
      >
        <h1 className="font-semibold mb-6">Doctor Panel</h1>

        <nav className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `

           flex items-center gap-3 px-3 py-2 rounded-lg text-sm

           ${
             isActive
               ? "bg-teal-50 text-teal-700 font-medium"
               : "text-slate-600 hover:bg-slate-100"
           }

          `
                }
              >
                <Icon size={18} />

                {item.name}
              </NavLink>
            );
          })}

          {/* logout */}

          <button
            onClick={logout}
            className="flex items-center gap-3 mt-6 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 text-sm w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}
