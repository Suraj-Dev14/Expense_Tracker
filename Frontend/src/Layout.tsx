import { Outlet } from "react-router-dom";
import NavigationBar from "./ProjectComponents/NavigationBar";

const Layout = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col md:flex-row">
        <NavigationBar />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pd-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;
