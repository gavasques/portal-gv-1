import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, 
  Users, 
  Package, 
  Wrench, 
  UserPlus, 
  ShoppingCart, 
  FileText, 
  Bot, 
  MessageSquare, 
  BookOpen, 
  Calculator, 
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useState } from "react";

const menuItems = [
  { 
    label: "Dashboard", 
    href: "/dashboard", 
    icon: Home,
    accessLevels: ["basic", "aluno", "aluno_pro", "suporte", "admin"]
  },
  { 
    label: "Parceiros", 
    href: "/partners", 
    icon: Users,
    accessLevels: ["aluno", "aluno_pro", "suporte", "admin"]
  },
  { 
    label: "Fornecedores", 
    href: "/suppliers", 
    icon: Package,
    accessLevels: ["aluno", "aluno_pro", "suporte", "admin"]
  },
  { 
    label: "Ferramentas", 
    href: "/tools", 
    icon: Wrench,
    accessLevels: ["aluno", "aluno_pro", "suporte", "admin"]
  },
  { 
    label: "Meus Fornecedores", 
    href: "/my-suppliers", 
    icon: UserPlus,
    accessLevels: ["aluno", "aluno_pro", "suporte", "admin"]
  },
  { 
    label: "Meus Produtos", 
    href: "/my-products", 
    icon: ShoppingCart,
    accessLevels: ["aluno", "aluno_pro", "suporte", "admin"]
  },
  { 
    label: "Templates", 
    href: "/templates", 
    icon: FileText,
    accessLevels: ["aluno", "aluno_pro", "suporte", "admin"]
  },
  { 
    label: "Agentes de IA", 
    href: "/ai-agents", 
    icon: Bot,
    accessLevels: ["aluno", "aluno_pro", "suporte", "admin"]
  },
  { 
    label: "Chamados", 
    href: "/tickets", 
    icon: MessageSquare,
    accessLevels: ["basic", "aluno", "aluno_pro", "suporte", "admin"]
  },
  { 
    label: "Materiais", 
    href: "/materials", 
    icon: BookOpen,
    accessLevels: ["basic", "aluno", "aluno_pro", "suporte", "admin"]
  },
  { 
    label: "Simuladores", 
    href: "/simulators", 
    icon: Calculator,
    accessLevels: ["aluno", "aluno_pro", "suporte", "admin"]
  },
  { 
    label: "Nossos Cursos", 
    href: "/courses", 
    icon: GraduationCap,
    accessLevels: ["basic", "aluno", "aluno_pro", "suporte", "admin"]
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { open, setOpen } = useSidebar();

  if (!user) return null;

  const filteredMenuItems = menuItems.filter(item => 
    item.accessLevels.includes(user.accessLevel.toLowerCase())
  );

  return (
    <div className={cn(
      "flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
      open ? "w-64" : "w-16"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {open && (
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Portal do Aluno
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          className="shrink-0"
        >
          {open ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || location.startsWith(item.href + "/");
          
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "sidebar-link",
                  isActive && "active",
                  !open && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {open && <span className="ml-3">{item.label}</span>}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      {open && user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.fullName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.fullName || user.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user.accessLevel}
              </p>
            </div>
          </div>
          {user.accessLevel !== "basic" && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Créditos IA: {user.aiCredits}
            </div>
          )}
        </div>
      )}
    </div>
  );
}