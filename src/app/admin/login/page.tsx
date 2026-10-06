import { LoginForm } from "@/ui/admin/login-form";

// Demo: formulario sin credenciales reales. El login con TOTP llega en la S4 (paso 1.3).
export default function LoginPage() {
  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="font-display text-3xl">Entrar al panel</h1>
      <p className="mt-2 text-sm text-white/60">Acceso privado para Sofi. Demo sin contraseña.</p>
      <LoginForm />
    </div>
  );
}
