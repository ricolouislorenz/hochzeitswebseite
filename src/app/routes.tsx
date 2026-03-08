import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Login } from "./components/Login";
import { GuestView } from "./components/GuestView";
import { AdminDashboard } from "./components/AdminDashboard";
import { BuffetList } from "./components/BuffetList";
import { BuffetListView } from "./components/BuffetListView";
import { WeddingGame } from "./components/WeddingGame";
import { PhotoUpload } from "./components/PhotoUpload";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: "guest/:code", Component: GuestView },
      { path: "admin", Component: AdminDashboard },
      { path: "buffet", Component: BuffetList },
      { path: "buffet-view", Component: BuffetListView },
      { path: "wedding-game", Component: WeddingGame },
      { path: "fotos-teilen", Component: PhotoUpload },
    ],
  },
]);