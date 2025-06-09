import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import logoPath from "@assets/Asset 11-8_1749488723029.png";
import logoLightPath from "@assets/Asset 14-8_1749490361481.png";
import { useTheme } from "@/components/theme-provider";

export default function Login() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleReplitLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={theme === 'dark' ? logoPath : logoLightPath} 
            alt="Portal Guilherme Vasques" 
            className="mx-auto h-20 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">Portal Guilherme Vasques</h1>
          <p className="text-muted-foreground">Seu ecossistema digital para e-commerce</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Fazer Login</CardTitle>
            <CardDescription className="text-center">
              Entre com sua conta do Replit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleReplitLogin}
              className="w-full"
              size="lg"
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Entrar com Replit
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Use sua conta do Replit para acessar o portal
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}