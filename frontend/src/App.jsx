import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";

import AdminLayout from "./layouts/AdminLayout";
import ReceptionLayout from "./layouts/ReceptionLayout";
import DoctorLayout from "./layouts/DoctorLayout";

import Billing from "./pages/reception/Billing";
import Profile from "./pages/common/Profile";
import InvoicePage from "./pages/reception/InvoicePage";
import Prescriptions from "./pages/reception/Prescriptions";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Clinics from "./pages/admin/Clinics";
import Staff from "./pages/admin/Staff";
import Patients from "./pages/common/Patients";
import Patient from "./pages/admin/Patient";
import Inventory from "./pages/admin/Inventory";
import Finances from "./pages/admin/Finances";
import Invoice from "./pages/admin/Invoice";

import MyAppointments from "./pages/doctor/MyAppointments";
import Appointments from "./pages/reception/Appointments";

import PublicDietChart from "./pages/PublicDietChart";
import PublicHowToTake from "./pages/PublicHowToTake";
import PublicPrescription from "./pages/PublicPrescription";

// import InventoryLedger from "./pages/admin/InventoryLedger";

// simple test pages for now

// function DoctorDashboard() {
//   return (
//     <div className="p-10">
//       <h1 className="text-2xl font-semibold">Doctor Dashboard</h1>

//       <p className="text-slate-500 mt-2">Login successful</p>
//     </div>
//   );
// }

// function ReceptionDashboard(){

//  return(

//   <div className="p-10">

//    <h1 className="text-2xl font-semibold">

//     Reception Dashboard

//    </h1>

//    <p className="text-slate-500 mt-2">

//     Login successful

//    </p>

//   </div>

//  );

// }

// protected route

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />;
  }

  return children;
}

// role route

function RoleRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/" />;
  }

  if (user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* login */}

        <Route path="/" element={<Login />} />

        {/* admin */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <AdminLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="clinics" element={<Clinics />} />
          <Route path="patients" element={<Patients />} />
          <Route path="staff" element={<Staff />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="invoice" element={<Invoice />} />
          <Route path="/admin/finances" element={<Finances />} />
          {/* <Route path="inventory-ledger" element={<InventoryLedger />} /> */}
        </Route>

        {/* doctor */}

        <Route
          path="/doctor"
          element={
            <ProtectedRoute>
              <RoleRoute role="doctor">
                <DoctorLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<MyAppointments />} />
          
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* reception */}

        <Route
          path="/reception"
          element={
            <ProtectedRoute>
              <RoleRoute role="receptionist">
                <ReceptionLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Patients />} />
          <Route path="billing" element={<Billing />} />
          <Route path="profile" element={<Profile />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          
        </Route>

        <Route path="/invoice/:id" element={<InvoicePage />}/>
        <Route path="/diet-chart/:patientId" element={<PublicDietChart />}/>
        <Route path="/how-to-take/:patientId" element={<PublicHowToTake />}/>
        <Route path="/prescription/:patientId" element={<PublicPrescription />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
