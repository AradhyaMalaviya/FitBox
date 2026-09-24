import { useLocation, useNavigate } from "react-router-dom";
import { Dumbbell, Target, Utensils, Users, Home } from "lucide-react";

export const BottomTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const navItems = [
    { label: "Home", icon: Home, route: "/dashboard" },
    { label: "Exercises", icon: Dumbbell, route: "/exercises" },
    { label: "Workout", icon: Target, route: "/workout/active" },
    { label: "Nutrition", icon: Utensils, route: "/nutrition" },
    { label: "GymBuddy", icon: Users, route: "/gymbuddy/discover" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-lg border-t border-border/60 px-2 py-2 flex items-center justify-around max-w-md mx-auto rounded-t-2xl shadow-2xl md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = path === item.route || (item.route !== "/dashboard" && path.startsWith(item.route.split('/').slice(0, 2).join('/')));

        return (
          <button
            key={item.route}
            onClick={() => navigate(item.route)}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all duration-200 active:scale-95 ${
              isActive
                ? "text-primary font-semibold bg-primary/10 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
            aria-label={item.label}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-primary stroke-[2.5]" : "stroke-[1.75]"}`} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
