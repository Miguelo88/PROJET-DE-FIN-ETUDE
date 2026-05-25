import { Outlet } from "react-router-dom";
import { Navbar } from "../composants/UI/Navbar";

export function MainLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}