'use client'

import Layout from '../../src/components/Layout'
import AdminManager from '../../src/components/pages/AdminManager'

export default function AdminPage() {
  return (
    <Layout>
      <AdminManager
        defaultTab="clientes"
        showTabs={['clientes', 'sucursales']}
      />
    </Layout>
  )
}