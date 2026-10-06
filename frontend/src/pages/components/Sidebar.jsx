import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  Users,
  User,
  Wallet,
  Package,
  LogOut,
  FileText,
  BookText,
} from "lucide-react";

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  const menu = [
    { section: "GENERAL" },

    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },

    {
      name: "Clinics",
      path: "/admin/clinics",
      icon: Building2,
    },

    {
      name: "Staff",
      path: "/admin/staff",
      icon: Users,
    },

    {
      name: "Patients",
      path: "/admin/patients",
      icon: User,
    },

    {
      name: "Invoices",
      path: "/admin/invoice",
      icon: FileText,
    },

    { section: "MANAGEMENT" },

    {
      name: "Inventory",
      path: "/admin/inventory",
      icon: Package,
    },

    // {
    //   name: "Inventory Ledger",
    //   path: "/admin/inventory-ledger",
    //   icon: BookText,
    // },

    {
      name: "Finances",
      path: "/admin/finances",
      icon: Wallet,
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
        {/* logo */}

        <div className="mb-8">
          <h1 className="text-lg font-semibold text-slate-800">Dhrwuraj</h1>

          <p className="text-xs text-slate-400">Management system</p>
        </div>

        {/* menu */}

        <div className="space-y-6">
          {menu.map((item, i) => {
            if (item.section) {
              return (
                <p
                  key={i}
                  className="text-xs font-medium text-slate-400 tracking-wider"
                >
                  {item.section}
                </p>
              );
            }

            const Icon = item.icon;

            return (
              <NavLink
                key={i}
                to={item.path}
                end={item.path === "/admin"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `

         flex items-center gap-3

         px-3 py-2

         rounded-lg

         text-sm

         transition

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
        </div>

        {/* logout bottom */}

        <button
          onClick={logout}
          className="

     flex items-center gap-3

     px-3 py-2

     mt-6

     rounded-lg

     text-sm

     text-red-600

     hover:bg-red-50

     transition

     "
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </>
  );
}
