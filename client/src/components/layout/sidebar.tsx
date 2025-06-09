import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
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
  Menu,
  Settings,
  Shield,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useState } from "react";
import logoPath from "@assets/Asset 11-8_1749488723029.png";
import logoLightPath from "@assets/Asset 14-8_1749490361481.png";

// Student Area Menu Groups
const studentMenuGroups = [
  {
    title: "Principal",
    items: [
      { 
        label: "Dashboard", 
        href: "/dashboard", 
        icon: Home,
        accessLevels: ["basic", "aluno", "aluno_pro", "suporte", "admin"]
      }
    ]
  },
  {
    title: "Educacional",
    items: [
      { 
        label: "Nossos Cursos", 
        href: "/courses", 
        icon: GraduationCap,
        accessLevels: ["basic", "aluno", "aluno_pro", "suporte", "admin"]
      },
      { 
        label: "Materiais", 
        href: "/materials", 
        icon: BookOpen,
        accessLevels: ["basic", "aluno", "aluno_pro", "suporte", "admin"]
      },
      { 
        label: "Templates", 
        href: "/templates", 
        icon: FileText,
        accessLevels: ["aluno", "aluno_pro", "suporte", "admin"]
      }
    ]
  },
  {
    title: "Fornecedores & Produtos",
    items: [
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
      }
    ]
  },
  {
    title: "Ferramentas",
    items: [
      { 
        label: "Ferramentas", 
        href: "/tools", 
        icon: Wrench,
        accessLevels: ["aluno", "aluno_pro", "suporte", "admin"]
      },
      { 
        label: "Simuladores", 
        href: "/simulators", 
        icon: Calculator,
        accessLevels: ["aluno", "aluno_pro", "suporte", "admin"]
      },
      { 
        label: "Agentes de IA", 
        href: "/ai-agents", 
        icon: Bot,
        accessLevels: ["aluno", "aluno_pro", "suporte", "admin"]
      }
    ]
  },
  {
    title: "Suporte",
    items: [
      { 
        label: "Chamados", 
        href: "/tickets", 
        icon: MessageSquare,
        accessLevels: ["basic", "aluno", "aluno_pro", "suporte", "admin"]
      }
    ]
  }
];

// Admin Area Menu Groups
const adminMenuGroups = [
  {
    title: "Dashboard",
    items: [
      { 
        label: "Dashboard Admin", 
        href: "/admin", 
        icon: Home,
        accessLevels: ["admin", "suporte"]
      }
    ]
  },
  {
    title: "Gestão de Usuários",
    items: [
      { 
        label: "Usuários", 
        href: "/admin/users", 
        icon: Users,
        accessLevels: ["admin"]
      },
      { 
        label: "Acessos", 
        href: "/admin/access", 
        icon: Shield,
        accessLevels: ["admin"]
      }
    ]
  },
  {
    title: "Gestão de Conteúdo",
    items: [
      { 
        label: "Materiais", 
        href: "/admin/materials", 
        icon: BookOpen,
        accessLevels: ["admin", "suporte"]
      },
      { 
        label: "Cursos", 
        href: "/admin/courses", 
        icon: GraduationCap,
        accessLevels: ["admin", "suporte"]
      },
      { 
        label: "Templates", 
        href: "/admin/templates", 
        icon: FileText,
        accessLevels: ["admin", "suporte"]
      }
    ]
  },
  {
    title: "Sistema",
    items: [
      { 
        label: "Chamados", 
        href: "/admin/tickets", 
        icon: MessageSquare,
        accessLevels: ["admin", "suporte"]
      },
      { 
        label: "Parceiros", 
        href: "/admin/partners", 
        icon: Package,
        accessLevels: ["admin"]
      },
      { 
        label: "Fornecedores", 
        href: "/admin/suppliers", 
        icon: UserPlus,
        accessLevels: ["admin"]
      }
    ]
  },
  {
    title: "Configurações",
    items: [
      { 
        label: "Sistema", 
        href: "/admin/settings", 
        icon: Settings,
        accessLevels: ["admin"]
      }
    ]
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { open, setOpen } = useSidebar();
  const { theme } = useTheme();

  if (!user) return null;

  // Map backend access levels to frontend access levels
  const mapAccessLevel = (level: string) => {
    const mapping: Record<string, string> = {
      'Basic': 'basic',
      'Aluno': 'aluno', 
      'Aluno Pro': 'aluno_pro',
      'Suporte': 'suporte',
      'Administradores': 'admin'
    };
    return mapping[level] || level.toLowerCase();
  };

  const userAccessLevel = mapAccessLevel(user.accessLevel);
  const isAdminArea = location.startsWith('/admin');
  
  // Choose menu groups based on current area
  const currentMenuGroups = isAdminArea ? adminMenuGroups : studentMenuGroups;
  
  // Filter menu groups based on current area and user access
  const filteredMenuGroups = currentMenuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.accessLevels.includes(userAccessLevel))
  })).filter(group => group.items.length > 0);
  
  // Get current area context for display
  const currentAreaName = isAdminArea ? "Área Administrativa" : "Área do Aluno";
  const currentAreaRole = isAdminArea ? "ADMIN" : user.accessLevel?.toUpperCase() || "ALUNO";

  return (
    <div className={cn(
      "flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
      open ? "w-64" : "w-16"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {open && (
          <img 
            src={theme === 'dark' ? logoPath : logoLightPath} 
            alt="Portal Guilherme Vasques" 
            className="h-8 w-auto"
          />
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

      {/* Area Switching for Admin/Support */}
      {(userAccessLevel === "admin" || userAccessLevel === "suporte") && open && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <Link href="/dashboard" className="w-full">
              <Button 
                variant={!isAdminArea ? "default" : "outline"} 
                size="sm" 
                className="w-full text-xs"
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Aluno
              </Button>
            </Link>
            <Link href="/admin" className="w-full">
              <Button 
                variant={isAdminArea ? "default" : "outline"} 
                size="sm" 
                className="w-full text-xs"
              >
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {filteredMenuGroups.map((group) => (
          <div key={group.title}>
            {open && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || location.startsWith(item.href + "/");
                
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "sidebar-link",
                        isActive && "active",
                        !open && "justify-center px-2"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {open && <span className="ml-3">{item.label}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info */}
      {open && user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/settings">
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  user.fullName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.fullName || user.email.split('@')[0]}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    isAdminArea 
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : user.accessLevel === "Suporte"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : user.accessLevel === "Aluno Pro"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : user.accessLevel === "Aluno"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  )}>
                    {currentAreaRole}
                  </span>
                </div>
              </div>
              <Settings className="h-4 w-4 text-gray-400" />
            </div>
          </Link>
          {user.accessLevel !== "Basic" && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 px-2">
              Créditos IA: {user.aiCredits || 0}
            </div>
          )}
        </div>
      )}
    </div>
  );
}