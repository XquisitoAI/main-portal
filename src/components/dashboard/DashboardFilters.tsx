import React, { useState, useEffect, useRef } from "react";
import {
  CalendarIcon,
  UserIcon,
  LayersIcon,
  UsersIcon,
  FilterIcon,
  XIcon,
} from "lucide-react";
interface FilterProps {
  filters?: FilterState; // Prop opcional para hacer el componente controlado
  onFilterChange: (filters: FilterState) => void;
  restaurants?: Array<{ id: number; name: string }>;
}
export interface FilterState {
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  restaurantIds: number[];
  client: string;
  services: string[];
  gender: string;
  ageRange: {
    min: number;
    max: number;
  };
}

// Fecha por defecto (últimos 30 días)
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  return {
    startDate,
    endDate,
  };
};

const initialFilters: FilterState = {
  dateRange: getDefaultDateRange(),
  restaurantIds: [],
  client: "",
  services: [],
  gender: "",
  ageRange: {
    min: 0,
    max: 0,
  },
};
const DashboardFiltersComponent: React.FC<FilterProps> = ({
  filters: controlledFilters,
  onFilterChange,
  restaurants = [],
}) => {
  // Si recibimos filters como prop, usar esos (componente controlado)
  // Si no, usar estado interno (componente no controlado)
  const [internalFilters, setInternalFilters] =
    useState<FilterState>(initialFilters);
  const filters = controlledFilters || internalFilters;
  const setFilters = controlledFilters ? onFilterChange : setInternalFilters;
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isAgeRangeOpen, setIsAgeRangeOpen] = useState(false);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);

  // Estado temporal para las fechas antes de aplicar
  const [tempDateRange, setTempDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  // Refs para detectar clics fuera de los dropdowns
  const datePickerRef = useRef<HTMLDivElement>(null);
  const restaurantRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);
  const ageRangeRef = useRef<HTMLDivElement>(null);

  // Sincronizar tempDateRange cuando se abre el date picker
  useEffect(() => {
    if (isDatePickerOpen) {
      setTempDateRange(filters.dateRange);
    }
  }, [isDatePickerOpen, filters.dateRange]);

  // Notificar al padre cuando los filtros cambien (excepto en el mount inicial)
  // Solo se usa cuando el componente es no controlado
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (controlledFilters) return; // Si es controlado, no notificar aquí
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onFilterChange(filters);
  }, [filters, onFilterChange, controlledFilters]);

  // Detectar clics fuera de los dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
      if (
        restaurantRef.current &&
        !restaurantRef.current.contains(event.target as Node)
      ) {
        setIsRestaurantOpen(false);
      }
      if (
        servicesRef.current &&
        !servicesRef.current.contains(event.target as Node)
      ) {
        setIsServicesOpen(false);
      }
      if (
        genderRef.current &&
        !genderRef.current.contains(event.target as Node)
      ) {
        setIsGenderOpen(false);
      }
      if (
        ageRangeRef.current &&
        !ageRangeRef.current.contains(event.target as Node)
      ) {
        setIsAgeRangeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Lista de servicios para Super Admin
  const serviceOptions = ["Flex Bill", "Tap Order & Pay"];
  // Rangos de edad predefinidos
  const ageRangeOptions = [
    {
      label: "Todas las edades",
      min: 0,
      max: 0,
    },
    {
      label: "18-24",
      min: 18,
      max: 24,
    },
    {
      label: "25-34",
      min: 25,
      max: 34,
    },
    {
      label: "35-44",
      min: 35,
      max: 44,
    },
    {
      label: "45-54",
      min: 45,
      max: 54,
    },
    {
      label: "55+",
      min: 55,
      max: 100,
    },
  ];

  // Opciones de género
  const genderOptions = ["Masculino", "Femenino", "Otro"];

  // Helper para convertir Date a string formato YYYY-MM-DD (sin zona horaria)
  const dateToInputValue = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper para convertir string YYYY-MM-DD a Date (sin zona horaria)
  const inputValueToDate = (value: string): Date | null => {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const handleDateChange = (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    // Solo actualizar el estado temporal, no aplicar el filtro aún
    setTempDateRange(range);
  };

  const applyDateFilter = () => {
    // Validar que ambas fechas estén seleccionadas
    if (tempDateRange.startDate && tempDateRange.endDate) {
      const newFilters = {
        ...filters,
        dateRange: tempDateRange,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
      setIsDatePickerOpen(false);
    }
  };

  const cancelDateFilter = () => {
    // Restaurar las fechas temporales a las del filtro actual
    setTempDateRange(filters.dateRange);
    setIsDatePickerOpen(false);
  };

  const clearDateFilter = () => {
    // Limpiar las fechas
    const newFilters = {
      ...filters,
      dateRange: {
        startDate: null,
        endDate: null,
      },
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsDatePickerOpen(false);
  };

  const handleRestaurantToggle = (restaurantId: number) => {
    let updatedRestaurants;
    if (filters.restaurantIds.includes(restaurantId)) {
      updatedRestaurants = filters.restaurantIds.filter(
        (id) => id !== restaurantId
      );
    } else {
      updatedRestaurants = [...filters.restaurantIds, restaurantId];
    }
    const newFilters = {
      ...filters,
      restaurantIds: updatedRestaurants,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsRestaurantOpen(false);
  };

  const handleSelectAllRestaurants = () => {
    const newFilters = {
      ...filters,
      restaurantIds:
        filters.restaurantIds.length === restaurants.length
          ? []
          : restaurants.map((r) => r.id),
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsRestaurantOpen(false);
  };

  const handleServiceToggle = (service: string) => {
    let updatedServices;
    if (filters.services.includes(service)) {
      updatedServices = filters.services.filter((s) => s !== service);
    } else {
      updatedServices = [...filters.services, service];
    }
    const newFilters = {
      ...filters,
      services: updatedServices,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsServicesOpen(false);
  };

  const handleSelectAllServices = () => {
    const newFilters = {
      ...filters,
      services:
        filters.services.length === serviceOptions.length
          ? []
          : [...serviceOptions],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsServicesOpen(false);
  };

  const handleGenderChange = (gender: string) => {
    const newFilters = {
      ...filters,
      gender,
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
        max,
      },
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsAgeRangeOpen(false);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    onFilterChange(initialFilters);
  };

  // Verificar el rango de fechas y retornar el texto apropiado
  const getDateRangeLabel = () => {
    if (!filters.dateRange.startDate || !filters.dateRange.endDate) {
      return "Todo el tiempo";
    }

    const today = new Date();
    const startDate = filters.dateRange.startDate;
    const endDate = filters.dateRange.endDate;

    // Comparar las fechas
    const endDateStr = endDate.toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];

    // Calcular diferencia en días
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Verificar si el end date es hoy
    const isToday = endDateStr === todayStr;

    if (isToday) {
      if (diffDays === 7) {
        return "Últimos 7 días";
      } else if (diffDays === 30) {
        return "Últimos 30 días";
      } else if (diffDays === 90) {
        return "Últimos 90 días";
      } else if (diffDays >= 365 && diffDays <= 366) {
        return "Último año";
      }
    }

    // Si no coincide con ningún preset, mostrar las fechas
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  // Función helper para determinar qué acceso rápido está activo
  const getActiveQuickAccess = () => {
    if (!filters.dateRange.startDate || !filters.dateRange.endDate) {
      return "allTime";
    }

    const today = new Date();
    const startDate = filters.dateRange.startDate;
    const endDate = filters.dateRange.endDate;

    // Comparar solo las fechas (sin hora)
    const endDateStr = endDate.toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];

    // Calcular diferencia en días
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Verificar si el end date es hoy
    const isToday = endDateStr === todayStr;

    if (isToday) {
      if (diffDays === 7) return "last7days";
      if (diffDays === 30) return "last30days";
      if (diffDays === 90) return "last90days";
      if (diffDays >= 365 && diffDays <= 366) return "lastYear";
    }

    return "custom";
  };

  // Formato de fechas para mostrar
  const formatDateRange = () => {
    return getDateRangeLabel();
  };

  // Formato para mostrar servicios seleccionados
  const formatServices = () => {
    if (filters.services.length === 0) return "Todos los servicios";
    if (filters.services.length === 1) return filters.services[0];
    return `${filters.services.length} servicios`;
  };

  // Formato para mostrar restaurantes seleccionados
  const formatRestaurants = () => {
    if (filters.restaurantIds.length === 0) return "Todos los Restaurantes";
    if (filters.restaurantIds.length === 1) {
      return (
        restaurants.find((r) => r.id === filters.restaurantIds[0])?.name ||
        "1 restaurante"
      );
    }
    return `${filters.restaurantIds.length} restaurantes`;
  };

  // Formato para mostrar rango de edad
  const formatAgeRange = () => {
    if (filters.ageRange.min === 0 && filters.ageRange.max === 0) {
      return "Todas las edades";
    }
    return `${filters.ageRange.min}-${filters.ageRange.max === 100 ? "+" : filters.ageRange.max}`;
  };

  // Helper para determinar si un filtro está activo
  const isDateActive = filters.dateRange.startDate && filters.dateRange.endDate;
  const isRestaurantActive = filters.restaurantIds.length > 0;
  const isServiceActive = filters.services.length > 0;
  const isGenderActive = filters.gender !== "";
  const isAgeRangeActive = !(
    filters.ageRange.min === 0 && filters.ageRange.max === 0
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 mb-6 sticky top-0 z-10">
      <div className="flex flex-wrap items-center gap-2">
        {/* Filtro de Rango de Fechas */}
        <div className="relative" ref={datePickerRef}>
          <button
            className={`flex items-center px-3 py-1.5 rounded-md text-sm ${isDateActive ? "bg-teal-100 border border-teal-300 text-teal-700 hover:bg-teal-200" : "bg-gray-50 hover:bg-gray-100 text-gray-700"}`}
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
          >
            <CalendarIcon
              className={`w-4 h-4 mr-1.5 ${isDateActive ? "text-teal-500" : "text-gray-500"}`}
            />
            <span className="whitespace-nowrap">{formatDateRange()}</span>
          </button>
          {isDatePickerOpen && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 w-72">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1 font-medium">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full text-sm p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={dateToInputValue(tempDateRange.startDate)}
                    onChange={(e) =>
                      handleDateChange({
                        startDate: inputValueToDate(e.target.value),
                        endDate: tempDateRange.endDate,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1 font-medium">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split("T")[0]}
                    min={
                      tempDateRange.startDate
                        ? dateToInputValue(tempDateRange.startDate)
                        : undefined
                    }
                    className="w-full text-sm p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={dateToInputValue(tempDateRange.endDate)}
                    onChange={(e) =>
                      handleDateChange({
                        startDate: tempDateRange.startDate,
                        endDate: inputValueToDate(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Botones de acceso rápido */}
              <div className="mb-3 pt-2 border-t border-gray-200">
                <label className="text-xs text-gray-600 block mb-2 font-medium">
                  Accesos rápidos
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const newFilters = {
                        ...filters,
                        dateRange: { startDate: null, endDate: null },
                      };
                      setFilters(newFilters);
                      onFilterChange(newFilters);
                      setIsDatePickerOpen(false);
                    }}
                    className={`px-2 py-1.5 text-xs rounded transition-colors ${
                      getActiveQuickAccess() === "allTime"
                        ? "bg-teal-100 border border-teal-300 text-teal-700 font-medium"
                        : "text-gray-700 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    Todo el tiempo
                  </button>
                  <button
                    onClick={() => {
                      const endDate = new Date();
                      const startDate = new Date();
                      startDate.setDate(startDate.getDate() - 7);
                      const newFilters = {
                        ...filters,
                        dateRange: { startDate, endDate },
                      };
                      setFilters(newFilters);
                      onFilterChange(newFilters);
                      setIsDatePickerOpen(false);
                    }}
                    className={`px-2 py-1.5 text-xs rounded transition-colors ${
                      getActiveQuickAccess() === "last7days"
                        ? "bg-teal-100 border border-teal-300 text-teal-700 font-medium"
                        : "text-gray-700 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    Últimos 7 días
                  </button>
                  <button
                    onClick={() => {
                      const endDate = new Date();
                      const startDate = new Date();
                      startDate.setDate(startDate.getDate() - 30);
                      const newFilters = {
                        ...filters,
                        dateRange: { startDate, endDate },
                      };
                      setFilters(newFilters);
                      onFilterChange(newFilters);
                      setIsDatePickerOpen(false);
                    }}
                    className={`px-2 py-1.5 text-xs rounded transition-colors ${
                      getActiveQuickAccess() === "last30days"
                        ? "bg-teal-100 border border-teal-300 text-teal-700 font-medium"
                        : "text-gray-700 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    Últimos 30 días
                  </button>
                  <button
                    onClick={() => {
                      const endDate = new Date();
                      const startDate = new Date();
                      startDate.setDate(startDate.getDate() - 90);
                      const newFilters = {
                        ...filters,
                        dateRange: { startDate, endDate },
                      };
                      setFilters(newFilters);
                      onFilterChange(newFilters);
                      setIsDatePickerOpen(false);
                    }}
                    className={`px-2 py-1.5 text-xs rounded transition-colors ${
                      getActiveQuickAccess() === "last90days"
                        ? "bg-teal-100 border border-teal-300 text-teal-700 font-medium"
                        : "text-gray-700 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    Últimos 90 días
                  </button>
                  <button
                    onClick={() => {
                      const endDate = new Date();
                      const startDate = new Date();
                      startDate.setMonth(startDate.getMonth() - 12);
                      const newFilters = {
                        ...filters,
                        dateRange: { startDate, endDate },
                      };
                      setFilters(newFilters);
                      onFilterChange(newFilters);
                      setIsDatePickerOpen(false);
                    }}
                    className={`px-2 py-1.5 text-xs rounded transition-colors ${
                      getActiveQuickAccess() === "lastYear"
                        ? "bg-teal-100 border border-teal-300 text-teal-700 font-medium"
                        : "text-gray-700 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    Último año
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-200">
                {/* Botón de limpiar fechas */}
                {(filters.dateRange.startDate || filters.dateRange.endDate) && (
                  <button
                    onClick={clearDateFilter}
                    className="w-full px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                  >
                    Limpiar fechas
                  </button>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    onClick={cancelDateFilter}
                    className="flex-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={applyDateFilter}
                    disabled={
                      !tempDateRange.startDate || !tempDateRange.endDate
                    }
                    className="flex-1 px-3 py-1.5 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtro de Restaurante */}
        <div className="relative" ref={restaurantRef}>
          <button
            className={`flex items-center px-3 py-1.5 rounded-md text-sm ${isRestaurantActive ? "bg-teal-100 border border-teal-300 text-teal-700 hover:bg-teal-200" : "bg-gray-50 hover:bg-gray-100 text-gray-700"}`}
            onClick={() => setIsRestaurantOpen(!isRestaurantOpen)}
          >
            <UserIcon
              className={`w-4 h-4 mr-1.5 ${isRestaurantActive ? "text-teal-500" : "text-gray-500"}`}
            />
            <span className="whitespace-nowrap">{formatRestaurants()}</span>
          </button>
          {isRestaurantOpen && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-64">
              <div
                className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-200 mb-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectAllRestaurants();
                }}
              >
                <input
                  type="checkbox"
                  id="restaurant-all"
                  checked={filters.restaurantIds.length === restaurants.length}
                  className="mr-2 pointer-events-none"
                  readOnly
                />
                <span className="text-sm flex-1 font-medium">
                  Todos los Restaurantes
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRestaurantToggle(restaurant.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      id={`restaurant-${restaurant.id}`}
                      checked={filters.restaurantIds.includes(restaurant.id)}
                      className="mr-2 pointer-events-none"
                      readOnly
                    />
                    <span className="text-sm flex-1">{restaurant.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filtro de Servicio */}
        <div className="relative" ref={servicesRef}>
          <button
            className={`flex items-center px-3 py-1.5 rounded-md text-sm ${isServiceActive ? "bg-teal-100 border border-teal-300 text-teal-700 hover:bg-teal-200" : "bg-gray-50 hover:bg-gray-100 text-gray-700"}`}
            onClick={() => setIsServicesOpen(!isServicesOpen)}
          >
            <LayersIcon
              className={`w-4 h-4 mr-1.5 ${isServiceActive ? "text-teal-500" : "text-gray-500"}`}
            />
            <span className="whitespace-nowrap">{formatServices()}</span>
          </button>
          {isServicesOpen && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-64">
              <div
                className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-200 mb-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectAllServices();
                }}
              >
                <input
                  type="checkbox"
                  id="service-all"
                  checked={filters.services.length === serviceOptions.length}
                  className="mr-2 pointer-events-none"
                  readOnly
                />
                <span className="text-sm flex-1 font-medium">
                  Todos los servicios
                </span>
              </div>
              {serviceOptions.map((service) => (
                <div
                  key={service}
                  className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleServiceToggle(service);
                  }}
                >
                  <input
                    type="checkbox"
                    id={`service-${service}`}
                    checked={filters.services.includes(service)}
                    className="mr-2 pointer-events-none"
                    readOnly
                  />
                  <span className="text-sm flex-1">{service}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filtro de Género */}
        <div className="relative" ref={genderRef}>
          <button
            className={`flex items-center px-3 py-1.5 rounded-md text-sm ${isGenderActive ? "bg-teal-100 border border-teal-300 text-teal-700 hover:bg-teal-200" : "bg-gray-50 hover:bg-gray-100 text-gray-700"}`}
            onClick={() => setIsGenderOpen(!isGenderOpen)}
          >
            <UsersIcon
              className={`w-4 h-4 mr-1.5 ${isGenderActive ? "text-teal-500" : "text-gray-500"}`}
            />
            <span className="whitespace-nowrap">
              {filters.gender || "Todos los Diners"}
            </span>
          </button>
          {isGenderOpen && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-48">
              <div
                className="px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-sm"
                onClick={() => handleGenderChange("")}
              >
                Todos los Diners
              </div>
              {genderOptions.map((gender) => (
                <div
                  key={gender}
                  className={`px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-sm ${filters.gender === gender ? "bg-teal-50 text-teal-700" : ""}`}
                  onClick={() => handleGenderChange(gender)}
                >
                  {gender}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filtro de Rango de Edad */}
        <div className="relative" ref={ageRangeRef}>
          <button
            className={`flex items-center px-3 py-1.5 rounded-md text-sm ${isAgeRangeActive ? "bg-teal-100 border border-teal-300 text-teal-700 hover:bg-teal-200" : "bg-gray-50 hover:bg-gray-100 text-gray-700"}`}
            onClick={() => setIsAgeRangeOpen(!isAgeRangeOpen)}
          >
            <FilterIcon
              className={`w-4 h-4 mr-1.5 ${isAgeRangeActive ? "text-teal-500" : "text-gray-500"}`}
            />
            <span className="whitespace-nowrap">{formatAgeRange()}</span>
          </button>
          {isAgeRangeOpen && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-48">
              {ageRangeOptions.map((range) => (
                <div
                  key={range.label}
                  className={`px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-sm ${filters.ageRange.min === range.min && filters.ageRange.max === range.max ? "bg-teal-50 text-teal-700" : ""}`}
                  onClick={() => handleAgeRangeChange(range.min, range.max)}
                >
                  {range.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Limpiar Filtros */}
        <button
          className="ml-auto flex items-center text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-md text-sm"
          onClick={clearFilters}
        >
          <XIcon className="w-4 h-4 mr-1" />
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

const DashboardFilters = React.memo(
  DashboardFiltersComponent,
  (prevProps: FilterProps, nextProps: FilterProps) => {
    // Solo re-renderizar si las props realmente cambiaron
    const restaurantsEqual =
      JSON.stringify(prevProps.restaurants) ===
      JSON.stringify(nextProps.restaurants);
    const onFilterChangeEqual =
      prevProps.onFilterChange === nextProps.onFilterChange;
    const filtersEqual =
      JSON.stringify(prevProps.filters) === JSON.stringify(nextProps.filters);

    // Retornar true para SKIP render (las props son iguales)
    return restaurantsEqual && onFilterChangeEqual && filtersEqual;
  }
);

DashboardFilters.displayName = "DashboardFilters";

export default DashboardFilters;
