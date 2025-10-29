import React, { useState } from 'react';
import { CalendarIcon, UserIcon, LayersIcon, UsersIcon, FilterIcon, XIcon } from 'lucide-react';
interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
}
export interface FilterState {
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  client: string;
  services: string[];
  gender: string;
  ageRange: {
    min: number;
    max: number;
  };
}
const initialFilters: FilterState = {
  dateRange: {
    startDate: null,
    endDate: null
  },
  client: '',
  services: [],
  gender: '',
  ageRange: {
    min: 18,
    max: 65
  }
};
const DashboardFilters: React.FC<FilterProps> = ({
  onFilterChange
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isAgeRangeOpen, setIsAgeRangeOpen] = useState(false);
  const [isClientOpen, setIsClientOpen] = useState(false);
  // Lista de servicios
  const serviceOptions = ['Tap Order & Pay', 'Flex Bill', 'Tap and Pay', 'Pick & Go', 'Food Hall'];
  // Lista de clientes (simulada)
  const clientOptions = ['Restaurante El Dorado', 'La Trattoria Italiana', 'Sushi Express', 'Burger King', 'McDonalds', 'Starbucks', 'KFC'];
  // Rangos de edad predefinidos
  const ageRangeOptions = [{
    label: '18-24',
    min: 18,
    max: 24
  }, {
    label: '25-34',
    min: 25,
    max: 34
  }, {
    label: '35-44',
    min: 35,
    max: 44
  }, {
    label: '45-54',
    min: 45,
    max: 54
  }, {
    label: '55+',
    min: 55,
    max: 100
  }];
  // Opciones de género
  const genderOptions = ['Masculino', 'Femenino', 'Otro'];
  const handleDateChange = (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    const newFilters = {
      ...filters,
      dateRange: range
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsDatePickerOpen(false);
  };
  const handleClientChange = (client: string) => {
    const newFilters = {
      ...filters,
      client
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsClientOpen(false);
  };
  const handleServiceToggle = (service: string) => {
    let updatedServices;
    if (filters.services.includes(service)) {
      updatedServices = filters.services.filter(s => s !== service);
    } else {
      updatedServices = [...filters.services, service];
    }
    const newFilters = {
      ...filters,
      services: updatedServices
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  const handleGenderChange = (gender: string) => {
    const newFilters = {
      ...filters,
      gender
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsGenderOpen(false);
  };
  const handleAgeRangeChange = (min: number, max: number) => {
    const newFilters = {
      ...filters,
      ageRange: {
        min,
        max
      }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsAgeRangeOpen(false);
  };
  const clearFilters = () => {
    setFilters(initialFilters);
    onFilterChange(initialFilters);
  };
  // Formato de fechas para mostrar
  const formatDateRange = () => {
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      return `${filters.dateRange.startDate.toLocaleDateString()} - ${filters.dateRange.endDate.toLocaleDateString()}`;
    }
    return 'Seleccionar fechas';
  };
  // Formato para mostrar servicios seleccionados
  const formatServices = () => {
    if (filters.services.length === 0) return 'Todos los servicios';
    if (filters.services.length === 1) return filters.services[0];
    return `${filters.services.length} servicios`;
  };
  // Formato para mostrar rango de edad
  const formatAgeRange = () => {
    return `${filters.ageRange.min}-${filters.ageRange.max === 100 ? '+' : filters.ageRange.max}`;
  };
  return <div className="bg-white rounded-lg shadow-sm p-3 mb-6 sticky top-0 z-10">
      <div className="flex flex-wrap items-center gap-2">
        {/* Filtro de Rango de Fechas */}
        <div className="relative">
          <button className="flex items-center bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
            <CalendarIcon className="w-4 h-4 mr-1.5 text-gray-500" />
            <span className="whitespace-nowrap">{formatDateRange()}</span>
          </button>
          {isDatePickerOpen && <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 w-64">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Inicio
                  </label>
                  <input type="date" className="w-full text-sm p-1.5 border border-gray-200 rounded" onChange={e => handleDateChange({
                startDate: e.target.value ? new Date(e.target.value) : null,
                endDate: filters.dateRange.endDate
              })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Fin
                  </label>
                  <input type="date" className="w-full text-sm p-1.5 border border-gray-200 rounded" onChange={e => handleDateChange({
                startDate: filters.dateRange.startDate,
                endDate: e.target.value ? new Date(e.target.value) : null
              })} />
                </div>
              </div>
            </div>}
        </div>
        {/* Filtro de Cliente */}
        <div className="relative">
          <button className="flex items-center bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm" onClick={() => setIsClientOpen(!isClientOpen)}>
            <UserIcon className="w-4 h-4 mr-1.5 text-gray-500" />
            <span className="whitespace-nowrap">
              {filters.client || 'Todos los Administradores'}
            </span>
          </button>
          {isClientOpen && <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-64">
              <input type="text" placeholder="Buscar administrador..." className="w-full text-sm p-2 border border-gray-200 rounded mb-2" />
              <div className="max-h-48 overflow-y-auto">
                <div className="px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-sm" onClick={() => handleClientChange('')}>
                  Todos los Administradores
                </div>
                {clientOptions.map(client => <div key={client} className={`px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-sm ${filters.client === client ? 'bg-purple-50 text-purple-700' : ''}`} onClick={() => handleClientChange(client)}>
                    {client}
                  </div>)}
              </div>
            </div>}
        </div>
        {/* Filtro de Servicio */}
        <div className="relative">
          <button className="flex items-center bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm" onClick={() => setIsServicesOpen(!isServicesOpen)}>
            <LayersIcon className="w-4 h-4 mr-1.5 text-gray-500" />
            <span className="whitespace-nowrap">{formatServices()}</span>
          </button>
          {isServicesOpen && <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-64">
              {serviceOptions.map(service => <div key={service} className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                  <input type="checkbox" id={`service-${service}`} checked={filters.services.includes(service)} onChange={() => handleServiceToggle(service)} className="mr-2" />
                  <label htmlFor={`service-${service}`} className="text-sm cursor-pointer flex-1">
                    {service}
                  </label>
                </div>)}
            </div>}
        </div>
        {/* Filtro de Género */}
        <div className="relative">
          <button className="flex items-center bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm" onClick={() => setIsGenderOpen(!isGenderOpen)}>
            <UsersIcon className="w-4 h-4 mr-1.5 text-gray-500" />
            <span className="whitespace-nowrap">
              {filters.gender || 'Todos los Diners'}
            </span>
          </button>
          {isGenderOpen && <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-48">
              <div className="px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-sm" onClick={() => handleGenderChange('')}>
                Todos los Diners
              </div>
              {genderOptions.map(gender => <div key={gender} className={`px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-sm ${filters.gender === gender ? 'bg-purple-50 text-purple-700' : ''}`} onClick={() => handleGenderChange(gender)}>
                  {gender}
                </div>)}
            </div>}
        </div>
        {/* Filtro de Rango de Edad */}
        <div className="relative">
          <button className="flex items-center bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm" onClick={() => setIsAgeRangeOpen(!isAgeRangeOpen)}>
            <FilterIcon className="w-4 h-4 mr-1.5 text-gray-500" />
            <span className="whitespace-nowrap">{formatAgeRange()}</span>
          </button>
          {isAgeRangeOpen && <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-48">
              {ageRangeOptions.map(range => <div key={range.label} className={`px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-sm ${filters.ageRange.min === range.min && filters.ageRange.max === range.max ? 'bg-purple-50 text-purple-700' : ''}`} onClick={() => handleAgeRangeChange(range.min, range.max)}>
                  {range.label}
                </div>)}
            </div>}
        </div>
        {/* Botón Limpiar Filtros */}
        <button className="ml-auto flex items-center text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-md text-sm" onClick={clearFilters}>
          <XIcon className="w-4 h-4 mr-1" />
          Limpiar filtros
        </button>
      </div>
    </div>;
};
export default DashboardFilters;