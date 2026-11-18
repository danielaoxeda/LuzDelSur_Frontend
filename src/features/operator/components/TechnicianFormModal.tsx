import { useState } from 'react';
import { ActionModal } from '../../../shared/components/ActionModal';
import type { TechnicianCreateRequest } from '../types/operator.types';

interface TechnicianFormModalProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (request: TechnicianCreateRequest) => void;
}

type FieldErrors = Partial<Record<'name' | 'username' | 'password', string>>;

/**
 * Alta de técnicos: POST /api/v1/operator/technicians.
 * El backend valida nombre (120), usuario (120) y contraseña (6 a 72).
 */
export function TechnicianFormModal({
  isSubmitting,
  onCancel,
  onConfirm,
}: TechnicianFormModalProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const inputClass =
    'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';
  const labelClass =
    'mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500';

  const handleConfirm = () => {
    const nextErrors: FieldErrors = {};
    const cleanName = name.trim();
    const cleanUsername = username.trim();

    if (!cleanName) {
      nextErrors.name = 'Indique el nombre del técnico.';
    } else if (cleanName.length > 120) {
      nextErrors.name = 'El nombre admite como máximo 120 caracteres.';
    }

    if (!cleanUsername) {
      nextErrors.username = 'Indique el usuario de acceso.';
    } else if (cleanUsername.length > 120) {
      nextErrors.username = 'El usuario admite como máximo 120 caracteres.';
    }

    if (!password) {
      nextErrors.password = 'Indique una contraseña inicial.';
    } else if (password.length < 6 || password.length > 72) {
      nextErrors.password = 'La contraseña debe tener entre 6 y 72 caracteres.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onConfirm({ name: cleanName, username: cleanUsername, password });
  };

  return (
    <ActionModal
      open
      title="Nuevo técnico"
      description="Se creará una cuenta con rol TECNICO. El técnico podrá iniciar sesión con estas credenciales y recibir casos asignados."
      confirmLabel="Crear técnico"
      isSubmitting={isSubmitting}
      onCancel={onCancel}
      onConfirm={handleConfirm}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="technician-name" className={labelClass}>
            Nombre completo *
          </label>
          <input
            id="technician-name"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            maxLength={120}
            placeholder="Ej. Cuadrilla T-15 (J. Pérez)"
            className={inputClass}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className="mt-1 text-xs font-semibold text-rose-600">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="technician-username" className={labelClass}>
            Usuario *
          </label>
          <input
            id="technician-username"
            type="text"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setErrors((prev) => ({ ...prev, username: undefined }));
            }}
            maxLength={120}
            placeholder="tecnico3@luzdelsur.com.pe"
            autoComplete="off"
            className={inputClass}
            aria-invalid={Boolean(errors.username)}
          />
          {errors.username && (
            <p className="mt-1 text-xs font-semibold text-rose-600">
              {errors.username}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="technician-password" className={labelClass}>
            Contraseña inicial *
          </label>
          <input
            id="technician-password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            minLength={6}
            maxLength={72}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            className={inputClass}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && (
            <p className="mt-1 text-xs font-semibold text-rose-600">
              {errors.password}
            </p>
          )}
        </div>
      </div>
    </ActionModal>
  );
}
