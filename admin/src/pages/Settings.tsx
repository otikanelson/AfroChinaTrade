import { useState } from 'react'
import { Save } from 'lucide-react'
import Layout from '@/components/Layout'
import toast from 'react-hot-toast'

export default function Settings() {
  const [settings, setSettings] = useState({
    siteName: 'AfroChinaTrade',
    siteEmail: 'admin@afrochinatrade.com',
    maintenanceMode: false,
    enableNotifications: true,
    enableAnalytics: true,
  })

  const handleChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    toast.success('Settings saved successfully!')
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div
        className="w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-700/20 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"
        style={{ backgroundColor: checked ? '#C41E3A' : '#E5E7EB' }}
      />
    </label>
  )

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
          <p className="text-neutral-600 mt-1">Manage platform settings</p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* General */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/30 focus:border-red-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">Site Email</label>
                <input
                  type="email"
                  value={settings.siteEmail}
                  onChange={(e) => handleChange('siteEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/30 focus:border-red-700"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Features</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900">Maintenance Mode</p>
                  <p className="text-sm text-neutral-600">Disable access for all users</p>
                </div>
                <Toggle checked={settings.maintenanceMode} onChange={(v) => handleChange('maintenanceMode', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900">Enable Notifications</p>
                  <p className="text-sm text-neutral-600">Send notifications to users</p>
                </div>
                <Toggle checked={settings.enableNotifications} onChange={(v) => handleChange('enableNotifications', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900">Enable Analytics</p>
                  <p className="text-sm text-neutral-600">Track user behavior and metrics</p>
                </div>
                <Toggle checked={settings.enableAnalytics} onChange={(v) => handleChange('enableAnalytics', v)} />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
            style={{ backgroundColor: '#C41E3A' }}
          >
            <Save size={20} />
            Save Settings
          </button>
        </div>
      </div>
    </Layout>
  )
}
