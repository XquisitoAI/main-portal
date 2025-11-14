import React, { useState } from 'react';
import { FilterIcon, XIcon } from 'lucide-react';
import type { SuperAdminFilters } from '../../types/api';

interface SuperAdminFiltersProps {
  restaurants: Array<{ id: number; name: string }>;
  onFilterChange: (filters: SuperAdminFilters) => void;
}

const SuperAdminFiltersComponent: React.FC<SuperAdminFiltersProps> = ({
  restaurants,
  onFilterChange
}) => {
  // Configurar fechas por defecto (últimos 30 días)
  const defaultEndDate = new Date().toISOString().split('T')[0];
  const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [filters, setFilters] = useState<SuperAdminFilters>({
    start_date: defaultStartDate,
    end_date: defaultEndDate,
    restaurant_id: undefined,
    service: 'todos',
    gender: 'todos',
    age_range: 'todos'
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof SuperAdminFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: SuperAdminFilters = {
      start_date: defaultStartDate,
      end_date: defaultEndDate,
      restaurant_id: undefined,
      service: 'todos',
      gender: 'todos',
      age_range: 'todos'
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FilterIcon className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Filtros</h3>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {showFilters ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Fecha de inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.start_date || ''}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha de fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.end_date || ''}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Restaurante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurante
            </label>
            <select
              value={typeof filters.restaurant_id === 'number' ? filters.restaurant_id : ''}
              onChange={(e) => handleFilterChange('restaurant_id', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los restaurantes</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servicio
            </label>
            <select
              value={filters.service || 'todos'}
              onChange={(e) => handleFilterChange('service', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="flex-bill">Flex Bill</option>
              <option value="tap-order-pay">Tap Order & Pay</option>
            </select>
          </div>

          {/* Género */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género
            </label>
            <select
              value={filters.gender || 'todos'}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </div>

          {/* Rango de edad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rango de Edad
            </label>
            <select
              value={filters.age_range || 'todos'}
              onChange={(e) => handleFilterChange('age_range', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45-54">45-54</option>
              <option value="55+">55+</option>
            </select>
          </div>
        </div>
      )}

      {showFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <XIcon className="h-4 w-4 mr-1" />
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default SuperAdminFiltersComponent;
