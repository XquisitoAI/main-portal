import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  QrCodeIcon,
  DownloadIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { QrCodeBatchFormData, QrCode } from "../../types";

const QrManager: React.FC = () => {
  const {
    branches,
    clients,
    qrCodes,
    loading,
    error,
    loadQrCodes,
    createBatchQrCodes,
    deleteQrCode,
    updateQrCode,
  } = useAppContext();

  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    number | null
  >(null);
  const [service, setService] = useState<
    "flex-bill" | "tap-order-pay" | "room-service" | "pick-n-go" | "tap-pay"
  >("flex-bill");
  const [qrType, setQrType] = useState<"table" | "room" | "pickup">("table");
  const [count, setCount] = useState(1);
  const [startNumber, setStartNumber] = useState(1);
  const [showQrForm, setShowQrForm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editingQrCode, setEditingQrCode] = useState<QrCode | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredBranches = selectedClientId
    ? branches.filter((branch) => branch.clientId === selectedClientId)
    : branches;
  const selectedBranch = branches.find(
    (branch) => branch.id === selectedBranchId
  );
  const selectedClient = clients.find(
    (client) => client.id === selectedClientId
  );
  const clientName = selectedBranch
    ? clients.find((client) => client.id === selectedBranch.clientId)?.name
    : "";

  // Obtener servicios disponibles según el cliente seleccionado
  const availableServices = selectedClient?.services || [];

  // Mapeo de servicios a tipos de QR
  const serviceToQrType: Record<string, "table" | "room" | "pickup"> = {
    "flex-bill": "table",
    "tap-order-pay": "table",
    "room-service": "room",
    "pick-n-go": "pickup",
    "tap-pay":"table"
  };

  // Auto-detectar tipo de QR cuando cambia el servicio
  useEffect(() => {
    const detectedType = serviceToQrType[service];
    if (detectedType && detectedType !== qrType) {
      setQrType(detectedType);
    }

    // Para Pick & Go, siempre setear count a 1
    if (service === "pick-n-go") {
      setCount(1);
      setStartNumber(1);
    }
  }, [service]);

  // Reset service if client changes and service is no longer available
  useEffect(() => {
    if (selectedClientId && service && !availableServices.includes(service)) {
      setService("flex-bill"); // Reset to default
    }
  }, [selectedClientId, availableServices]);

  // Cargar QR codes cuando cambia el filtro
  useEffect(() => {
    const filters = {
      ...(selectedClientId && { clientId: selectedClientId }),
      ...(selectedBranchId && { branchId: selectedBranchId }),
    };
    loadQrCodes(filters);
  }, [selectedClientId, selectedBranchId]);

  // Verificar si ya existe un QR de Pick & Go para la sucursal seleccionada
  const existingPickAndGoQr = service === "pick-n-go" && selectedBranchId
    ? qrCodes.find(
        (qr) => qr.branchId === selectedBranchId && qr.service === "pick-n-go"
      )
    : null;

  // Validar que el número de QR codes solicitado no exceda la capacidad
  const validateQrCodeCount = (): boolean => {
    setValidationError(null);

    if (!selectedBranch) {
      setValidationError("Por favor selecciona una sucursal");
      return false;
    }

    // Validación especial para Pick & Go: solo 1 QR por sucursal
    if (service === "pick-n-go") {
      const existingPickAndGoQr = qrCodes.find(
        (qr) => qr.branchId === selectedBranchId && qr.service === "pick-n-go"
      );

      if (existingPickAndGoQr) {
        setValidationError(
          "Ya existe un código QR de Pick & Go para esta sucursal. Solo se permite 1 QR de Pick & Go por sucursal."
        );
        return false;
      }
      return true;
    }

    const maxAllowed =
      qrType === "table"
        ? selectedBranch.tables
        : qrType === "room"
          ? clients.find((c) => c.id === selectedBranch.clientId)?.roomCount ||
            0
          : 100; // pickup no tiene límite estricto

    const endNumber = startNumber + count - 1;

    if (qrType === "table" && endNumber > selectedBranch.tables) {
      setValidationError(
        `La sucursal solo tiene ${selectedBranch.tables} mesas. No puedes generar QR codes más allá de la mesa ${selectedBranch.tables}.`
      );
      return false;
    }

    const client = clients.find((c) => c.id === selectedBranch.clientId);
    if (qrType === "room" && client) {
      const roomCount = client.roomCount || 0;
      if (endNumber > roomCount) {
        setValidationError(
          `El cliente solo tiene ${roomCount} habitaciones. No puedes generar QR codes más allá de la habitación ${roomCount}.`
        );
        return false;
      }
    }

    if (count < 1 || count > 500) {
      setValidationError("Puedes generar entre 1 y 500 códigos QR a la vez");
      return false;
    }

    if (startNumber < 1) {
      setValidationError("El número inicial debe ser al menos 1");
      return false;
    }

    return true;
  };

  const handleGenerateQrCodes = async () => {
    if (!selectedBranchId || !selectedRestaurantId) {
      setValidationError("Debes seleccionar un cliente y sucursal");
      return;
    }

    if (!validateQrCodeCount()) {
      return;
    }

    try {
      const batchData: QrCodeBatchFormData = {
        clientId: selectedClientId,
        restaurantId: selectedRestaurantId,
        branchId: selectedBranchId,
        branchNumber: selectedBranch!.branchNumber || 1,
        service,
        qrType,
        count: service === "pick-n-go" ? 1 : count,
        startNumber: service === "pick-n-go" ? 1 : startNumber,
        ...(qrType === "table" && { tableNumber: startNumber }),
        ...(qrType === "room" && { roomNumber: startNumber }),
      };

      await createBatchQrCodes(batchData);
      setShowQrForm(false);
      setValidationError(null);

      // Recargar los QR codes
      await loadQrCodes({ branchId: selectedBranchId });
    } catch (err: any) {
      setValidationError(err.message || "Error al generar códigos QR");
    }
  };

  const handleDeleteQrCode = async (id: string) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este código QR?")
    ) {
      try {
        await deleteQrCode(id);
      } catch (err: any) {
        alert("Error al eliminar el código QR: " + err.message);
      }
    }
  };

  const handleDownloadQrCode = (qrCode: QrCode) => {
    const svg = document.querySelector(`#qr-${qrCode.id} svg`) as SVGElement;
    if (!svg) {
      alert("Error al encontrar el código QR");
      return;
    }

    // Crear un canvas para convertir el SVG a imagen de alta resolución
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Escala para alta resolución (10x más grande = 1200x1200 píxeles)
    const scale = 10;
    const size = 120 * scale; // 1200x1200

    // Obtener las dimensiones del SVG
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Configurar el canvas con dimensiones de alta resolución
      canvas.width = size;
      canvas.height = size;

      // Fondo blanco
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar la imagen escalada para alta resolución
      ctx.imageSmoothingEnabled = false; // Para mantener bordes nítidos del QR
      ctx.drawImage(img, 0, 0, size, size);

      // Convertir el canvas a PNG de alta calidad y descargar
      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = `QR-${qrCode.code}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
        },
        "image/png",
        1.0 // Calidad máxima
      );

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  // const handleToggleStatus = async (id: string) => {
  //   try {
  //     await toggleQrCodeStatus(id);
  //   } catch (err: any) {
  //     alert('Error al cambiar el estado del código QR: ' + err.message);
  //   }
  // };

  const handleEditQrCode = (qrCode: QrCode) => {
    setEditingQrCode(qrCode);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingQrCode) return;

    try {
      // Obtener el branch_number de la sucursal seleccionada
      const selectedBranch = branches.find(b => b.id === editingQrCode.branchId);

      await updateQrCode(editingQrCode.id, {
        service: editingQrCode.service,
        qrType: editingQrCode.qrType,
        tableNumber: editingQrCode.tableNumber,
        roomNumber: editingQrCode.roomNumber,
        branchId: editingQrCode.branchId,
        branchNumber: selectedBranch?.branchNumber,
      });
      setShowEditModal(false);
      setEditingQrCode(null);
    } catch (err: any) {
      alert("Error al actualizar el código QR: " + err.message);
    }
  };

  // Auto-detectar tipo de QR cuando cambia el servicio en edición
  useEffect(() => {
    if (editingQrCode) {
      const detectedType = serviceToQrType[editingQrCode.service];
      if (detectedType && detectedType !== editingQrCode.qrType) {
        setEditingQrCode({ ...editingQrCode, qrType: detectedType });
      }
    }
  }, [editingQrCode?.service]);

  // Filtra los códigos QR por sucursal seleccionada
  const filteredQrCodes = selectedBranchId
    ? qrCodes.filter((qr) => qr.branchId === selectedBranchId)
    : qrCodes;

  // Función para determinar por qué el botón está desactivado
  const getDisabledReason = (): string | null => {
    if (!selectedClientId) return "Debes seleccionar un cliente";
    if (!selectedBranchId) return "Debes seleccionar una sucursal";
    if (!selectedRestaurantId) {
      console.log("🔍 DEBUG - Branch seleccionada:", selectedBranch);
      console.log("🔍 DEBUG - restaurantId:", selectedRestaurantId);
      return "La sucursal seleccionada no tiene un restaurant_id válido";
    }
    if (!service) return "Debes seleccionar un servicio";
    if (loading.isSaving) return "Generando códigos QR...";

    // Validación especial para Pick & Go
    if (service === "pick-n-go" && existingPickAndGoQr) {
      return "Ya existe un código QR de Pick & Go para esta sucursal";
    }

    // Validar que la cantidad no exceda la capacidad
    if (selectedBranch) {
      const endNumber = startNumber + count - 1;

      if (qrType === "table" && endNumber > selectedBranch.tables) {
        return `La sucursal solo tiene ${selectedBranch.tables} mesas. No puedes generar hasta la mesa ${endNumber}.`;
      }

      if (qrType === "room") {
        const client = clients.find((c) => c.id === selectedBranch.clientId);
        const roomCount = client?.roomCount || 0;
        if (endNumber > roomCount) {
          return `El cliente solo tiene ${roomCount} habitaciones. No puedes generar hasta la habitación ${endNumber}.`;
        }
      }
    }

    return null;
  };

  const disabledReason = getDisabledReason();
  const isButtonDisabled = !!disabledReason;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">QR Manager</h1>
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => setShowQrForm(true)}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Generar Nuevos QR
        </button>
      </div>
      {showQrForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Generar Códigos QR en Lote
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  setSelectedBranchId("");
                  setSelectedRestaurantId(null);
                }}
              >
                <option value="">Seleccionar Cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sucursal
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedBranchId}
                onChange={(e) => {
                  const branchId = e.target.value;
                  setSelectedBranchId(branchId);
                  const branch = branches.find((b) => b.id === branchId);
                  if (branch) {
                    setSelectedRestaurantId(branch.restaurantId || null);
                  }
                }}
                disabled={!selectedClientId}
              >
                <option value="">Seleccionar Sucursal</option>
                {filteredBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.tables} mesas)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servicio
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={service}
                onChange={(e) => setService(e.target.value as any)}
                disabled={!selectedClientId}
              >
                <option value="">Seleccionar Servicio</option>
                {availableServices.includes("flex-bill") && (
                  <option value="flex-bill">Flex Bill</option>
                )}
                {availableServices.includes("tap-order-pay") && (
                  <option value="tap-order-pay">Tap Order & Pay</option>
                )}
                {availableServices.includes("room-service") && (
                  <option value="room-service">Room Service</option>
                )}
                {availableServices.includes("pick-n-go") && (
                  <option value="pick-n-go">Pick & Go</option>
                )}
                {availableServices.includes("tap-pay") && (
                  <option value="tap-pay">Tap & Pay</option>
                )}
              </select>
            </div>

            {service !== "pick-n-go" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número Inicial
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={startNumber}
                  onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                  disabled={!selectedBranchId}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Número de{" "}
                  {qrType === "table"
                    ? "mesa"
                    : qrType === "room"
                      ? "habitación"
                      : "pickup"}{" "}
                  inicial
                </p>
              </div>
            )}

            {service !== "pick-n-go" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  disabled={!selectedBranchId}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Del {startNumber} al {startNumber + count - 1} (máx. 500)
                </p>
              </div>
            )}

            {service === "pick-n-go" && !existingPickAndGoQr && (
              <div className="col-span-2">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Pick & Go:</strong> Solo se permite 1 QR por sucursal. Este QR será válido para toda la sucursal.
                  </p>
                </div>
              </div>
            )}

            {service === "pick-n-go" && existingPickAndGoQr && (
              <div className="col-span-2">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>⚠️ Ya existe un código QR de Pick & Go para esta sucursal.</strong> Solo se permite 1 QR de Pick & Go por sucursal. No puedes crear otro.
                  </p>
                </div>
              </div>
            )}
          </div>

          {validationError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {validationError}
            </div>
          )}

          {!validationError && disabledReason && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
              ⚠️ {disabledReason}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => {
                setShowQrForm(false);
                setValidationError(null);
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              onClick={handleGenerateQrCodes}
              disabled={isButtonDisabled}
              title={disabledReason || ""}
            >
              {loading.isSaving
                ? "Generando..."
                : `Generar ${count} QR${count > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800">
            Códigos QR Generados
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {selectedBranchId
              ? `Mostrando códigos QR para ${clientName} - ${selectedBranch?.name}`
              : "Selecciona un cliente y sucursal para ver los códigos QR"}
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  setSelectedBranchId("");
                }}
              >
                <option value="">Todos los Clientes</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sucursal
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                disabled={!selectedClientId}
              >
                <option value="">Todas las Sucursales</option>
                {filteredBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {loading.isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Cargando códigos QR...</p>
          </div>
        ) : filteredQrCodes.length > 0 ? (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredQrCodes.map((qrCode) => {
              const branch = branches.find((b) => b.id === qrCode.branchId);
              const client = branch
                ? clients.find((c) => c.id === branch.clientId)
                : null;
              const qrUrl = `https://xquisito.ai/qr/${qrCode.code}`;

              return (
                <div
                  key={qrCode.id}
                  className={`border rounded-lg p-4 flex flex-col items-center ${qrCode.isActive ? "border-gray-200 bg-white" : "border-gray-300 bg-gray-50 opacity-60"}`}
                >
                  <div className="mb-3 text-center w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${qrCode.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
                      >
                        {qrCode.isActive ? "Activo" : "Inactivo"}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          qrCode.service === "flex-bill"
                            ? "bg-purple-100 text-purple-700"
                            : qrCode.service === "tap-order-pay"
                              ? "bg-blue-100 text-blue-700"
                              : qrCode.service === "room-service"
                                ? "bg-green-100 text-green-700"
                                : qrCode.service === "tap-pay"
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {qrCode.service
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm">{client?.name}</h3>
                    <p className="text-xs text-gray-500">{branch?.name}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">
                      {qrCode.qrType === "table" &&
                        `Mesa #${qrCode.tableNumber}`}
                      {qrCode.qrType === "room" &&
                        `Habitación #${qrCode.roomNumber}`}
                      {qrCode.qrType === "pickup" && "Pickup"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      {qrCode.code}
                    </p>
                  </div>
                  <div
                    id={`qr-${qrCode.id}`}
                    className="bg-white p-2 border border-gray-200 rounded-lg mb-3"
                  >
                    <QRCodeSVG
                      value={qrUrl}
                      size={120}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="flex flex-col space-y-2 w-full mt-2">
                    <div className="flex space-x-2">
                      <button
                        className="flex-1 flex items-center justify-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        onClick={() => handleDownloadQrCode(qrCode)}
                      >
                        <DownloadIcon className="h-3 w-3 mr-1" />
                        Descargar
                      </button>
                      {/* <button
                        className="flex-1 flex items-center justify-center px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        onClick={() => window.print()}
                      >
                        <PrinterIcon className="h-3 w-3 mr-1" />
                        Imprimir
                      </button> */}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="flex-1 flex items-center justify-center px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                        onClick={() => handleEditQrCode(qrCode)}
                      >
                        <EditIcon className="h-3 w-3 mr-1" />
                        Editar
                      </button>
                      {/* <button
                        className={`flex-1 flex items-center justify-center px-3 py-1 text-xs rounded-lg ${qrCode.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        onClick={() => handleToggleStatus(qrCode.id)}
                        disabled={loading.isSaving}
                      >
                        {qrCode.isActive ? <PowerOffIcon className="h-3 w-3 mr-1" /> : <PowerIcon className="h-3 w-3 mr-1" />}
                        {qrCode.isActive ? 'Desactivar' : 'Activar'}
                      </button> */}
                      <button
                        className="flex items-center justify-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        onClick={() => handleDeleteQrCode(qrCode.id)}
                        disabled={loading.isDeleting}
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center p-6 bg-gray-100 rounded-full mb-4">
              <QrCodeIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">
              No hay códigos QR generados
            </h3>
            <p className="text-gray-500 mb-4">
              Selecciona una sucursal y genera códigos QR para sus mesas
            </p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => setShowQrForm(true)}
            >
              Generar QR
            </button>
          </div>
        )}
      </div>

      {/* Modal de Edición */}
      {showEditModal && editingQrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Editar Código QR
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  value={
                    clients.find((c) => c.id === editingQrCode.clientId)
                      ?.name || ""
                  }
                  disabled
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sucursal
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingQrCode.branchId}
                  onChange={(e) =>
                    setEditingQrCode({
                      ...editingQrCode,
                      branchId: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccionar Sucursal</option>
                  {branches
                    .filter(
                      (branch) => branch.clientId === editingQrCode.clientId
                    )
                    .map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingQrCode.service}
                  onChange={(e) =>
                    setEditingQrCode({
                      ...editingQrCode,
                      service: e.target.value as any,
                    })
                  }
                >
                  <option value="">Seleccionar Servicio</option>
                  {(() => {
                    const editingClient = clients.find(
                      (c) => c.id === editingQrCode.clientId
                    );
                    const clientServices = editingClient?.services || [];
                    const serviceLabels: Record<string, string> = {
                      "flex-bill": "Flex Bill",
                      "tap-order-pay": "Tap Order & Pay",
                      "room-service": "Room Service",
                      "pick-n-go": "Pick & Go",
                      "tap-pay": "Tap & Pay",
                    };
                    return clientServices.map((serviceId) => (
                      <option key={serviceId} value={serviceId}>
                        {serviceLabels[serviceId] || serviceId}
                      </option>
                    ));
                  })()}
                </select>
              </div>

              {editingQrCode.qrType === "table" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Mesa
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingQrCode.tableNumber || ""}
                    onChange={(e) =>
                      setEditingQrCode({
                        ...editingQrCode,
                        tableNumber: parseInt(e.target.value) || null,
                      })
                    }
                  />
                </div>
              )}

              {editingQrCode.qrType === "room" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Habitación
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingQrCode.roomNumber || ""}
                    onChange={(e) =>
                      setEditingQrCode({
                        ...editingQrCode,
                        roomNumber: parseInt(e.target.value) || null,
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingQrCode(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={handleSaveEdit}
                disabled={loading.isSaving}
              >
                {loading.isSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default QrManager;
