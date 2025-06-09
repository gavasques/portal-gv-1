import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Partners from "@/pages/partners";
import Suppliers from "@/pages/suppliers";
import Tools from "@/pages/tools";
import MySuppliers from "@/pages/my-suppliers";
import MyProducts from "@/pages/my-products";
import Templates from "@/pages/templates";
import AiAgents from "@/pages/ai-agents";
import Tickets from "@/pages/tickets";
import Materials from "@/pages/materials";
import MaterialView from "@/pages/material-view";
import AdminMaterials from "@/pages/admin-materials";
import AdminCadastros from "@/pages/admin-cadastros";
import Simulators from "@/pages/simulators";
import Courses from "@/pages/courses";
import Settings from "@/pages/settings";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import ResetPassword from "@/pages/reset-password";
import { useAuth } from "./hooks/use-auth";
import Sidebar from "./components/layout/sidebar";
import Topbar from "./components/layout/topbar";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/partners" component={Partners} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/tools" component={Tools} />
        <Route path="/my-suppliers" component={MySuppliers} />
        <Route path="/my-products" component={MyProducts} />
        <Route path="/templates" component={Templates} />
        <Route path="/ai-agents" component={AiAgents} />
        <Route path="/tickets" component={Tickets} />
        <Route path="/materials" component={Materials} />
        <Route path="/materials/:id" component={MaterialView} />
        <Route path="/simulators" component={Simulators} />
        <Route path="/courses" component={Courses} />
        <Route path="/settings" component={Settings} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/materials" component={AdminMaterials} />
        <Route path="/admin/cadastros" component={AdminCadastros} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/access" component={() => <div>Admin Access Control - Em desenvolvimento</div>} />
        <Route path="/admin/courses" component={() => <div>Admin Courses - Em desenvolvimento</div>} />
        <Route path="/admin/templates" component={() => <div>Admin Templates - Em desenvolvimento</div>} />
        <Route path="/admin/tickets" component={() => <div>Admin Tickets - Em desenvolvimento</div>} />
        <Route path="/admin/partners" component={() => <div>Admin Partners - Em desenvolvimento</div>} />
        <Route path="/admin/suppliers" component={() => <div>Admin Suppliers - Em desenvolvimento</div>} />
        <Route path="/admin/settings" component={() => <div>Admin Settings - Em desenvolvimento</div>} />
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
