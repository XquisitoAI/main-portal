import React, { useState, useMemo, useEffect } from "react";
import { useTransactionHistory } from "../../hooks/useApiData";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ReceiptIcon,
  CalendarIcon,
  BuildingIcon,
} from "lucide-react";
import type {
  SuperAdminFilters,
  TransactionHistoryItem,
} from "../../types/api";

interface TransactionHistoryTableProps {
  filters: SuperAdminFilters;
}

const ITEMS_PER_PAGE = 5;

// Colores para cada servicio (mismos que las gráficas)
const getServiceBadgeClasses = (serviceType: string): string => {
  switch (serviceType) {
    case "Flex Bill":
      return "bg-green-100 text-green-700 border border-green-200";
    case "Tap Order & Pay":
      return "bg-violet-100 text-violet-700 border border-violet-200";
    case "Pick & Go":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "Room Service":
      return "bg-red-100 text-red-700 border border-red-200";
    case "Tap & Pay":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  filters,
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      limit: ITEMS_PER_PAGE,
      offset: currentPage * ITEMS_PER_PAGE,
    }),
    [filters, currentPage]
  );

  const { data, isLoading, isError, error } =
    useTransactionHistory(queryFilters);

  useEffect(() => {
    setCurrentPage(0);
  }, [
    filters.start_date,
    filters.end_date,
    filters.restaurant_id,
    filters.service,
  ]);

  const transactions = data?.data || [];
  const totalCount = data?.pagination?.total_count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-sm text-gray-500">Cargando transacciones...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
          <ReceiptIcon className="h-6 w-6 text-red-600" />
        </div>
        <p className="text-red-600">
          Error al cargar transacciones: {(error as Error)?.message}
        </p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <ReceiptIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-base font-medium text-gray-900 mb-1">
          No hay transacciones
        </h3>
        <p className="text-sm text-gray-500">
          No se encontraron transacciones para el periodo seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Vista móvil: Cards */}
      <div className="block md:hidden space-y-3">
        {transactions.map((tx: TransactionHistoryItem) => (
          <div
            key={tx.id}
            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-500">
                {formatDate(tx.created_at)} {formatTime(tx.created_at)}
              </div>
              <span
                className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${getServiceBadgeClasses(tx.service_type)}`}
              >
                {tx.service_type}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 mb-2 truncate">
              {tx.restaurant_name}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Volumen:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(tx.total_amount_charged)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Propina:</span>
                <span className="text-gray-600">
                  {formatCurrency(tx.tip_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Restaurant:</span>
                <span className="text-green-600">
                  {formatCurrency(tx.restaurant_net_income)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Xquisito:</span>
                <span className="text-blue-600">
                  {formatCurrency(tx.xquisito_net_income)}
                </span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-gray-500">Ecart:</span>
                <span className="text-purple-600">
                  {formatCurrency(tx.ecart_commission_total)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vista desktop: Tabla mejorada */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    Fecha
                  </div>
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="h-4 w-4 text-gray-400" />
                    Restaurante
                  </div>
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Volumen
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Propina
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <span className="text-green-600">Restaurant</span>
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <span className="text-blue-600">Xquisito</span>
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                  <span className="text-purple-600">Ecart</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {transactions.map((tx: TransactionHistoryItem, index: number) => (
                <tr
                  key={tx.id}
                  className={`hover:bg-blue-50/50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(tx.created_at)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatTime(tx.created_at)}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium truncate max-w-[180px]">
                      {tx.restaurant_name}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getServiceBadgeClasses(tx.service_type)}`}
                    >
                      {tx.service_type}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(tx.total_amount_charged)}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-600">
                      {formatCurrency(tx.tip_amount)}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(tx.restaurant_net_income)}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-blue-600">
                      {formatCurrency(tx.xquisito_net_income)}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right hidden lg:table-cell">
                    <span className="text-sm font-medium text-purple-600">
                      {formatCurrency(tx.ecart_commission_total)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación mejorada */}
      <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 mt-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{currentPage * ITEMS_PER_PAGE + 1}</span>
          {" - "}
          <span className="font-medium">
            {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount)}
          </span>
          {" de "}
          <span className="font-medium">{totalCount}</span>
          {" transacciones"}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Anterior
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (currentPage < 3) {
                pageNum = i;
              } else if (currentPage > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryTable;
