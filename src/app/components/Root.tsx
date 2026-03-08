import { Outlet } from "react-router";

export function Root() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Outlet />
    </div>
  );
}
