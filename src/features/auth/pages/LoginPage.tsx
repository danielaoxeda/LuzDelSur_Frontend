import { Zap } from 'lucide-react';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 w-full bg-[#0B132B]" />

        <div className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B132B] text-white">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-base font-extrabold leading-none tracking-tight text-slate-900">
                  Luz del Sur
                </p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  Distribución Eléctrica
                </p>
              </div>
            </div>

            <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
              Iniciar Sesión
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Ingrese sus credenciales de acceso al sistema
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
