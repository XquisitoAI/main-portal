import Link from 'next/link'
import { ShieldCheckIcon } from 'lucide-react'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <ShieldCheckIcon className="mx-auto h-16 w-16 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Acceso Restringido
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Main Portal - Super Administradores
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                El registro público no está disponible para este portal.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Solo los super administradores invitados pueden acceder al sistema.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-500 text-center">
                Si ya tienes una cuenta, puedes iniciar sesión:
              </p>
              <Link
                href="/sign-in"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center">
                Para solicitar acceso, contacta al administrador del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}