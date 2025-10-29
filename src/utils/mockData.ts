// Datos de ejemplo para el dashboard
export const mockClients = [{
  id: 'client1',
  name: 'Restaurante El Dorado',
  active: true,
  services: ['tap-order-pay', 'flex-bill', 'tap-pay'],
  createdAt: '2023-01-15T08:00:00Z'
}, {
  id: 'client2',
  name: 'La Trattoria Italiana',
  active: true,
  services: ['flex-bill', 'food-hall'],
  createdAt: '2023-03-10T10:30:00Z'
}, {
  id: 'client3',
  name: 'Sushi Express',
  active: true,
  services: ['pick-n-go', 'tap-pay'],
  createdAt: '2023-05-22T14:15:00Z'
}];
export const mockBranches = [{
  id: 'branch1',
  clientId: 'client1',
  name: 'Sucursal Centro',
  address: 'Av. Reforma 123, Centro',
  tables: 25,
  active: true
}, {
  id: 'branch2',
  clientId: 'client1',
  name: 'Sucursal Norte',
  address: 'Blvd. Norte 456, Zona Industrial',
  tables: 18,
  active: true
}, {
  id: 'branch3',
  clientId: 'client2',
  name: 'Sucursal Principal',
  address: 'Calle Italia 789, Polanco',
  tables: 30,
  active: true
}, {
  id: 'branch4',
  clientId: 'client3',
  name: 'Sucursal Plaza',
  address: 'Plaza Comercial 234, Reforma',
  tables: 15,
  active: true
}];
export const mockKpis = {
  sales: {
    total: 1245600,
    byClient: {
      client1: 685300,
      client2: 325800,
      client3: 234500
    },
    byBranch: {
      branch1: 385400,
      branch2: 299900,
      branch3: 325800,
      branch4: 234500
    }
  },
  orders: {
    total: 5842,
    byClient: {
      client1: 3256,
      client2: 1423,
      client3: 1163
    },
    byBranch: {
      branch1: 1876,
      branch2: 1380,
      branch3: 1423,
      branch4: 1163
    }
  },
  customers: {
    total: 3284,
    new: 156,
    byClient: {
      client1: 1845,
      client2: 864,
      client3: 575
    }
  },
  averageTicket: {
    total: 213.2,
    byClient: {
      client1: 210.5,
      client2: 228.9,
      client3: 201.6
    }
  },
  tableRotation: {
    average: 4.2,
    byBranch: {
      branch1: 4.8,
      branch2: 3.9,
      branch3: 4.3,
      branch4: 3.8
    }
  },
  conversionRate: {
    total: 24.5,
    byClient: {
      client1: 26.2,
      client2: 23.7,
      client3: 22.1
    }
  }
};
export const mockActivity = [{
  id: 'act1',
  type: 'order',
  orderId: '#5303',
  branchId: 'branch1',
  clientName: 'Juan Pérez',
  status: 'Completado',
  timestamp: new Date(Date.now() - 30 * 60000).toISOString()
}, {
  id: 'act2',
  type: 'order',
  orderId: '#931',
  branchId: 'branch2',
  clientName: 'Juan Pérez',
  status: 'Completado',
  timestamp: new Date(Date.now() - 2 * 60000).toISOString()
}, {
  id: 'act3',
  type: 'order',
  orderId: '#1268',
  branchId: 'branch3',
  clientName: 'Juan Pérez',
  status: 'Completado',
  timestamp: new Date(Date.now() - 23 * 60000).toISOString()
}, {
  id: 'act4',
  type: 'order',
  orderId: '#4570',
  branchId: 'branch1',
  clientName: 'Juan Pérez',
  status: 'Completado',
  timestamp: new Date(Date.now() - 29 * 60000).toISOString()
}, {
  id: 'act5',
  type: 'order',
  orderId: '#2985',
  branchId: 'branch4',
  clientName: 'Juan Pérez',
  status: 'Completado',
  timestamp: new Date(Date.now() - 2 * 60000).toISOString()
}];
// Nuevos datos para los KPIs globales y por servicio
export const mockGlobalKpis = {
  gmv: {
    value: 2540000,
    previous: 2340000,
    change: 8.5,
    trend: [1.2, 1.8, 1.5, 2.0, 2.3, 2.5]
  },
  revenue: {
    value: 152400,
    previous: 140400,
    change: 8.5,
    trend: [0.7, 0.9, 1.1, 1.3, 1.4, 1.5]
  },
  paidOrders: {
    value: 12450,
    previous: 11200,
    change: 11.2,
    trend: [9.5, 10.2, 10.8, 11.4, 11.9, 12.4]
  },
  successRate: {
    value: 94.3,
    previous: 92.1,
    change: 2.2,
    trend: [90.5, 91.2, 92.0, 92.8, 93.5, 94.3]
  },
  activeRestaurants: {
    value: 145,
    previous: 132,
    change: 9.8,
    trend: [110, 118, 125, 132, 138, 145]
  },
  activeServices: {
    value: 4,
    previous: 4,
    change: 0,
    trend: [4, 4, 4, 4, 4, 4]
  }
};
export const mockServiceKpis = [{
  id: 'flexbill',
  name: 'Flex Bill',
  status: 'active',
  gmv: 1270000,
  gmvPercentage: 50,
  usage: 75,
  quota: 100,
  keyMetric: {
    name: 'Órdenes',
    value: 6225,
    unit: ''
  },
  secondaryMetric: {
    name: 'Tiempo prom.',
    value: 18.5,
    unit: 'min'
  }
}, {
  id: 'tapandpay',
  name: 'Tap and Pay',
  status: 'active',
  gmv: 635000,
  gmvPercentage: 25,
  usage: 85,
  quota: 100,
  keyMetric: {
    name: 'Tasa de aprobación',
    value: 92.3,
    unit: '%'
  },
  secondaryMetric: {
    name: 'Fallos',
    value: 215,
    unit: ''
  }
}, {
  id: 'taporderpay',
  name: 'Tap Order & Pay',
  status: 'active',
  gmv: 381000,
  gmvPercentage: 15,
  usage: 68,
  quota: 100,
  keyMetric: {
    name: 'Órdenes digitales',
    value: 2840,
    unit: ''
  },
  secondaryMetric: {
    name: 'Ticket promedio',
    value: 134,
    unit: '$'
  }
}, {
  id: 'pickgo',
  name: 'Pick&Go',
  status: 'trial',
  gmv: 254000,
  gmvPercentage: 10,
  usage: 45,
  quota: 100,
  keyMetric: {
    name: 'Pedidos anticipados',
    value: 845,
    unit: ''
  },
  secondaryMetric: {
    name: 'Tiempo de recojo',
    value: 6.2,
    unit: 'min'
  }
}, {
  id: 'foodhall',
  name: 'Food Hall',
  status: 'trial',
  gmv: 127000,
  gmvPercentage: 5,
  usage: 30,
  quota: 100,
  keyMetric: {
    name: 'Locales activos',
    value: 8,
    unit: ''
  },
  secondaryMetric: {
    name: 'Órdenes por local',
    value: 124,
    unit: ''
  }
}, {
  id: 'scala',
  name: 'Scala',
  status: 'paused',
  gmv: 254000,
  gmvPercentage: 10,
  usage: 15,
  quota: 100,
  keyMetric: {
    name: 'Campañas',
    value: 12,
    unit: ''
  },
  secondaryMetric: {
    name: 'Revenue atribuido',
    value: 45600,
    unit: '$'
  }
}];