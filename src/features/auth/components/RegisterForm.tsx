import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { getHomeRouteForRole, useAuth } from '../../../shared/context/AuthContext';
import { useNotification } from '../../../shared/context/NotificationContext';
import { extractApiErrorMessage } from '../../../shared/services/api';

/**
 * El registro publico crea cuentas de CLIENTE. Las cuentas de operador y
 * tecnico las crea un operador (POST /api/v1/operator/technicians) o la
 * semilla de demo del backend.
 */

export function RegisterForm() {
  const { register } = useAuth();
  const { success, error: notifyError } = useNotification();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanUsername = username.trim();

    if (!cleanName) {
      setValidationError('Ingrese sus nombres y apellidos.');
      return;
    }
    if (!cleanUsername) {
      setValidationError('Ingrese un usuario o correo.');
      return;
    }
    if (password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      const authUser = await register({
        name: cleanName,
        username: cleanUsername,
        role: 'CLIENTE',
        password,
      });
      success(
        'Cuenta creada',
        `Bienvenido, ${authUser.name}.`
      );
      navigate(getHomeRouteForRole(authUser.role), { replace: true });
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudo completar el registro.');
      setValidationError(msg);
      notifyError('Error al registrar', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-3.5 py-2.5 text-xs text-blue-900">
        Se creará una cuenta de <strong>cliente</strong>. Las cuentas de operador y
        técnico las habilita un operador de Luz del Sur.
      </div>

      <div>
        <label
          htmlFor="register-name"
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600"
        >
          Nombres y apellidos *
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Ej. Carlos Mendoza Ríos"
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B132B] focus:bg-white focus:outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="register-username"
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600"
        >
          Usuario o correo electrónico *
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="register-username"
            type="email"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="usuario@ejemplo.com"
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B132B] focus:bg-white focus:outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="register-password"
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600"
        >
          Contraseña *
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Mínimo 6 caracteres"
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B132B] focus:bg-white focus:outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {validationError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
          {validationError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B132B] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{isSubmitting ? 'Registrando...' : 'Registrarme e Iniciar'}</span>
        <ArrowRight className="h-4 w-4" />
      </button>

      <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="font-semibold text-blue-700 hover:underline">
          Inicia sesión aquí
        </Link>
      </div>
    </form>
  );
}
