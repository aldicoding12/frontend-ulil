// sideList.jsx
import {
  Home,
  DollarSign,
  Calendar,
  Bell,
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
    name: "Donasi & Keuangan",
    icon: <DollarSign className="w-5 h-5" />,
    path: "/pengurus/keuangan",
  },
  {
    name: "Kegiatan & Kajian",
    icon: <Calendar className="w-5 h-5" />,
    path: "/pengurus/kegiatan",
  },
  {
    name: "Donasi",
    icon: <HandCoins className="w-5 h-5" />,
    path: "/pengurus/donasi",
  },
  {
    name: "Inventaris",
    icon: <Bell className="w-5 h-5" />,
    path: "/pengurus/inventory",
  },
  {
    name: "Pesan & Feedback",
    icon: <MessageSquare className="w-5 h-5" />,
    path: "/pengurus/feedback",
  },
  {
    name: "Pengaturan",
    icon: <Settings className="w-5 h-5" />,
    path: "/pengurus/pengaturan",
  },
];
