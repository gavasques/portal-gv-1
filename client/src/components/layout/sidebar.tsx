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
  UserCheck,
  Database,
  Key,
  ShieldCheck
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
      },
      { 
        label: "Prompts de IA", 
        href: "/ai-prompts", 
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
        accessLevels: ["admin", "suporte"]
      },
      { 
        label: "Controle de Acesso", 
        href: "/admin/permissions", 
        icon: ShieldCheck,
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
        label: "Cadastros", 
        href: "/admin/cadastros", 
        icon: Database,
        accessLevels: ["admin"]
      },
      { 
        label: "Templates", 
        href: "/admin/templates", 
        icon: FileText,
        accessLevels: ["admin", "suporte"]
      },
      { 
        label: "Prompts de IA", 
        href: "/admin/ai-prompts", 
        icon: Bot,
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
  // Map group ID to access level for compatibility
  const mapGroupIdToAccessLevel = (groupId: number | null) => {
    const mapping: Record<number, string> = {
      1: 'basic',        // Basic Group
      2: 'aluno',        // Aluno Group  
      3: 'aluno_pro',    // Aluno Pro Group
      4: 'suporte',      // Suporte Group
      5: 'admin'         // Admin Group
    };
    // Default to admin access if groupId is null (for existing users without groups)
    return groupId ? mapping[groupId] || 'admin' : 'admin';
  };

  const userAccessLevel = mapGroupIdToAccessLevel(user.groupId);
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
  const getGroupName = (groupId: number | null) => {
    const groupNames: Record<number, string> = {
      1: 'BASIC',
      2: 'ALUNO', 
      3: 'ALUNO PRO',
      4: 'SUPORTE',
      5: 'ADMIN'
    };
    return groupId ? groupNames[groupId] || 'ALUNO' : 'ALUNO';
  };
  const currentAreaRole = isAdminArea ? "ADMIN" : getGroupName(user.groupId);

  return (
    <div className={cn(
      "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
      open ? "w-64" : "w-16"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {open && (
          <span className="text-2xl font-['Pacifico'] text-primary">logo</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          className="shrink-0 text-gray-500 hover:text-gray-700"
        >
          {open ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Area Switching for Admin/Support */}
      {(userAccessLevel === "admin" || userAccessLevel === "suporte") && open && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <Link href="/dashboard" className="w-full">
              <Button 
                variant={!isAdminArea ? "default" : "outline"} 
                size="sm" 
                className={cn(
                  "w-full text-xs",
                  !isAdminArea ? "bg-primary text-white" : "border-gray-200 text-gray-700"
                )}
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Aluno
              </Button>
            </Link>
            <Link href="/admin" className="w-full">
              <Button 
                variant={isAdminArea ? "default" : "outline"} 
                size="sm" 
                className={cn(
                  "w-full text-xs",
                  isAdminArea ? "bg-primary text-white" : "border-gray-200 text-gray-700"
                )}
              >
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {filteredMenuGroups.map((group) => (
          <div key={group.title}>
            {open && (
              <p className="text-xs uppercase font-semibold text-gray-500 mb-3">
                {group.title}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || location.startsWith(item.href + "/");

                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <div
                        className={cn(
                          "flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded transition-colors",
                          isActive && "bg-blue-50 border-l-3 border-l-primary text-primary",
                          !open && "justify-center px-2"
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5 shrink-0", 
                          isActive ? "text-primary" : "text-gray-500"
                        )} />
                        {open && <span className="ml-3">{item.label}</span>}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Info */}
      {open && user && (
        <div className="p-4 border-t border-gray-200">
          <Link href="/settings">
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.fullName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.fullName || user.email.split('@')[0]}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    isAdminArea 
                      ? "bg-red-100 text-red-800"
                      : userAccessLevel === "suporte"
                      ? "bg-yellow-100 text-yellow-800"
                      : userAccessLevel === "aluno_pro"
                      ? "bg-purple-100 text-purple-800"
                      : userAccessLevel === "aluno"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  )}>
                    {currentAreaRole}
                  </span>
                </div>
              </div>
              <Settings className="h-4 w-4 text-gray-400" />
            </div>
          </Link>
          {userAccessLevel !== "basic" && (
            <div className="mt-2 text-xs text-gray-500 px-2">
              Créditos IA: {user.aiCredits || 0}
            </div>
          )}
        </div>
      )}
    </div>
  );
}