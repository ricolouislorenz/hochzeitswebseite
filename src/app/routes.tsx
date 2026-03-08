import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Login } from "./components/Login";
import { GuestView } from "./components/GuestView";
import { AdminDashboard } from "./components/AdminDashboard";
import { BuffetList } from "./components/BuffetList";
import { BuffetListView } from "./components/BuffetListView";
import { WeddingGame } from "./components/WeddingGame";
import { TJAView } from "./components/TJAView";
import { Ceremony } from "./components/Ceremony";

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
      { path: "ablauf", Component: Ceremony },
      { path: "fotos-teilen", Component: TJAView },
    ],
  },
]);