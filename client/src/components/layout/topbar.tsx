import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Moon, 
  Sun, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";
import { useLocation } from "wouter";

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/partners': 'Parceiros',
  '/suppliers': 'Fornecedores', 
  '/tools': 'Ferramentas',
  '/my-suppliers': 'Meus Fornecedores',
  '/my-products': 'Meus Produtos',
  '/templates': 'Templates',
  '/ai-agents': 'Agentes de IA',
  '/tickets': 'Chamados',
  '/materials': 'Materiais',
  '/simulators': 'Simuladores',
  '/courses': 'Nossos Cursos',
};

export default function Topbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const currentPageName = pageNames[location] || 'Portal do Aluno';

  return (
    <header className="bg-background border-b border-border px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SidebarTrigger>

          {/* Page Title */}
          <div>
            <h1 className="text-xl font-semibold text-foreground">{currentPageName}</h1>
            <p className="text-sm text-muted-foreground">
              Bem-vindo de volta, {user.fullName.split(' ')[0]}!
            </p>
          </div>
        </div>

        {/* Top Bar Actions */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-lg"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative rounded-lg">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 h-10 px-3 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
