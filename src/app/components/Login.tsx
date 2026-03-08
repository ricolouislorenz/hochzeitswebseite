import { useState } from "react";
import { useNavigate } from "react-router";
import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "sonner";

export function Login() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Easter Egg: 404 opens the wedding game
    if (code === "404") {
      navigate("/wedding-game");
      return;
    }
    
    if (code.length !== 7) {
      toast.error("Bitte geben Sie einen 7-stelligen Code ein");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/guest/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ code }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.isAdmin) {
          toast.success("Admin-Login erfolgreich!");
          navigate("/admin");
        } else {
          // Save code to localStorage for GuestView
          localStorage.setItem('guestCode', code);
          toast.success("Erfolgreich angemeldet!");
          navigate(`/guest/${code}`);
        }
      } else {
        toast.error(data.error || "Ungültiger Code");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Fehler beim Anmelden");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F6F1E9] via-[#E8C7C8]/20 to-white">
      <Card className="w-full max-w-md border-2 border-[#E8C7C8] shadow-xl bg-white">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-[#E8C7C8]/30 rounded-full">
              <Heart className="size-12 text-[#C6A75E] fill-[#C6A75E]" />
            </div>
          </div>
          <CardTitle className="text-3xl font-serif text-slate-800">Willkommen</CardTitle>
          <CardDescription className="text-base text-slate-600">
            Bitte geben Sie Ihren 7-stelligen Einladungscode ein
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="1234567"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 7))}
                maxLength={7}
                className="text-center text-2xl tracking-widest font-mono border-2 border-slate-200 focus:border-[#C6A75E]"
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#C6A75E] hover:bg-[#A3B18A] text-white"
              disabled={isLoading || (code.length !== 7 && code !== "404")}
            >
              {isLoading ? "Wird überprüft..." : "Anmelden"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}