"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { UserIcon } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";

const Settings: React.FC = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <LoadingSpinner message="Cargando datos del usuario..." />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No se encontró información del usuario</p>
      </div>
    );
  }

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "No disponible";
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
        Configuración
      </h1>

      {/* Tarjeta de perfil */}
      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Columna izquierda - Título y Avatar */}
          <div className="lg:w-1/3">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Información del usuario
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Datos de tu cuenta de administrador.
            </p>

            {/* Avatar */}
            <div className="w-32 h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-16 h-16 text-gray-300" />
              )}
            </div>
          </div>

          {/* Columna derecha - Campos */}
          <div className="lg:w-2/3 space-y-5">
            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre completo
              </label>
              <div className="cursor-not-allowed w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                {user.fullName ||
                  `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                  "No especificado"}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="cursor-not-allowed w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                {user.primaryEmailAddress?.emailAddress || "No especificado"}
              </div>
            </div>

            {/* Grid de 2 columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fecha de registro
                </label>
                <div className="cursor-not-allowed w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                  {formatDate(user.createdAt)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Último acceso
                </label>
                <div className="cursor-not-allowed w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                  {formatDate(user.lastSignInAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
