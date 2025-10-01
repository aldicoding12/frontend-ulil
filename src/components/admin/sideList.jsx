// sideList.jsx
import {
  Home,
  DollarSign,
  Calendar,
  Warehouse,
  MessageSquare,
  Newspaper,
  Settings,
  HandCoins,
} from "lucide-react";

export const sideList = [
  {
    name: "Dashboard",
    icon: <Home className="w-5 h-5" />,
    path: "/pengurus",
  },
  {
    name: "Manajemen Berita",
    icon: <Newspaper className="w-5 h-5" />,
    path: "/pengurus/berita",
  },
  {
    name: "Manajemen Keuangan",
    icon: <DollarSign className="w-5 h-5" />,
    path: "/pengurus/keuangan",
  },
  {
    name: "Manajemen Kegiatan",
    icon: <Calendar className="w-5 h-5" />,
    path: "/pengurus/kegiatan",
  },
  {
    name: "Manajemen Donasi",
    icon: <HandCoins className="w-5 h-5" />,
    path: "/pengurus/donasi",
  },
  {
    name: "Manajemen Inventaris",
    icon: <Warehouse className="w-5 h-5" />,
    path: "/pengurus/inventory",
  },
  {
    name: "Manajemen Pesan",
    icon: <MessageSquare className="w-5 h-5" />,
    path: "/pengurus/feedback",
  },
  {
    name: "Pengaturan",
    icon: <Settings className="w-5 h-5" />,
    path: "/pengurus/settings",
  },
];
