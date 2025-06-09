import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Sidebar as SidebarComponent, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  Home, 
  Handshake, 
  Factory, 
  Wrench, 
  BookOpen, 
  Package, 
  FileText, 
  Bot, 
  Headphones, 
  BookMarked, 
  Calculator, 
  GraduationCap,
  Menu
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
];

const directoryItems = [
  { href: "/partners", label: "Parceiros", icon: Handshake },
  { href: "/suppliers", label: "Fornecedores", icon: Factory },
  { href: "/tools", label: "Ferramentas", icon: Wrench },
];

const myAreaItems = [
  { href: "/my-suppliers", label: "Meus Fornecedores", icon: BookOpen },
  { href: "/my-products", label: "Meus Produtos", icon: Package },
  { href: "/templates", label: "Templates", icon: FileText },
];

const aiItems = [
  { href: "/ai-agents", label: "Agentes de IA", icon: Bot, badge: true },
];

const supportItems = [
  { href: "/tickets", label: "Chamados", icon: Headphones, badge: true },
  { href: "/materials", label: "Materiais", icon: BookMarked },
  { href: "/simulators", label: "Simuladores", icon: Calculator },
  { href: "/courses", label: "Nossos Cursos", icon: GraduationCap },
];

function SidebarMenuItem({ href, label, icon: Icon, badge }: { 
  href: string; 
  label: string; 
  icon: any; 
  badge?: boolean;
}) {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const isActive = location === href;

  const badgeValue = badge && user ? (
    href === "/ai-agents" ? user.aiCredits : 
    href === "/tickets" ? 2 : undefined
  ) : undefined;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        onClick={() => navigate(href)}
        className={cn(
          "w-full justify-start",
          isActive && "bg-primary/10 text-primary dark:bg-primary/20"
        )}
      >
        <Icon className="h-4 w-4 mr-3" />
        <span className="flex-1">{label}</span>
        {badgeValue !== undefined && (
          <Badge variant={href === "/tickets" ? "destructive" : "secondary"} className="ml-auto">
            {badgeValue}
          </Badge>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function MenuSection({ title, items }: { title: string; items: any[] }) {
  return (
    <div className="pt-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
        {title}
      </p>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem 
            key={item.href} 
            href={item.href} 
            label={item.label} 
            icon={item.icon}
            badge={item.badge}
          />
        ))}
      </SidebarMenu>
    </div>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const { toggleSidebar } = useSidebar();

  if (!user) return null;

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'Basic': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'Aluno': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Aluno Pro': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Suporte': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Administradores': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <SidebarComponent className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold">Portal do Aluno</h1>
          </div>
          <SidebarTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SidebarTrigger>
        </div>
        
        {/* User Profile Section */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <Badge className={cn("text-xs", getAccessLevelColor(user.accessLevel))}>
                {user.accessLevel}
              </Badge>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 space-y-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem 
              key={item.href} 
              href={item.href} 
              label={item.label} 
              icon={item.icon}
            />
          ))}
        </SidebarMenu>

        <MenuSection title="Diretórios" items={directoryItems} />
        <MenuSection title="Minha Área" items={myAreaItems} />
        <MenuSection title="Inteligência Artificial" items={aiItems} />
        <MenuSection title="Suporte & Recursos" items={supportItems} />
      </SidebarContent>
    </SidebarComponent>
  );
}
