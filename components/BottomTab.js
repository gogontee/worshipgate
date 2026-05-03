import Link from "next/link";
import { useRouter } from "next/router";
import { Home, Music, User } from "lucide-react";

export default function BottomTab() {
  const router = useRouter();
  const currentPath = router.pathname;

  const tabs = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Music", href: "/music", icon: Music },
    { name: "Profile", href: (id) => `/dashboard/${id}`, icon: User, dynamic: true },
  ];

  // Get user id from URL for dynamic profile link
  const userId = router.query.id;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-white/10 py-2 px-4 md:hidden">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const href = tab.dynamic ? tab.href(userId) : tab.href;
          const isActive = currentPath === tab.name.toLowerCase() || 
            (tab.name === "Profile" && currentPath === "/dashboard/[id]");
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={href}
              className="flex flex-col items-center gap-1 text-white/60 hover:text-amber-400 transition"
            >
              <Icon size={22} className={isActive ? "text-amber-400" : ""} />
              <span className="text-[10px]">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}