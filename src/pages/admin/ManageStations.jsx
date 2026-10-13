import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, ArrowLeft, Search, Zap, MapPin, X, Check } from 'lucide-react'
import { getStations, createStation, updateStation, deleteStation, createPort, deletePort } from '../../services/api'
import StatusBadge from '../../components/StatusBadge'

export default function ManageStations() {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingStation, setEditingStation] = useState(null)
  const [managingPortsStation, setManagingPortsStation] = useState(null)

  // Form states
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: 'Mumbai',
    latitude: 19.076,
    longitude: 72.870,
    rating: 4.5,
    amenities: 'Cafe, Restroom, WiFi',
  })

  // New port state
  const [newPort, setNewPort] = useState({
    id: 'p1',
    type: 'DC Fast',
    powerKw: 60,
    pricePerKwh: 18,
    status: 'available',
  })

  async function loadStations() {
    setLoading(true)
    try {
      const data = await getStations()
      setStations(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStations()
  }, [])

  function openCreate() {
    setForm({
      name: '',
      address: '',
      city: 'Mumbai',
      latitude: 19.076,
      longitude: 72.870,
      rating: 4.5,
      amenities: 'Cafe, Restroom, WiFi',
    })
    setIsAddOpen(true)
  }

  function openEdit(s) {
    setEditingStation(s)
    setForm({
      name: s.name,
      address: s.address,
      city: s.city,
      latitude: s.latitude ?? 19.076,
      longitude: s.longitude ?? 72.870,
      rating: s.rating ?? 4.5,
      amenities: s.amenities ? s.amenities.join(', ') : '',
    })
  }

  async function handleSaveStation(e) {
    e.preventDefault()
    const payload = {
      name: form.name,
      address: form.address,
      city: form.city,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      rating: parseFloat(form.rating),
      amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
    }

    if (editingStation) {
      await updateStation(editingStation.id, payload)
      setEditingStation(null)
    } else {
      payload.ports = [
        {
          id: 'p1',
          type: 'DC Fast',
          powerKw: 60,
          pricePerKwh: 18,
          status: 'available',
          waitMins: 0,
        },
      ]
      await createStation(payload)
      setIsAddOpen(false)
    }

    loadStations()
  }

  async function handleDeleteStation(id) {
    if (!window.confirm('Are you sure you want to delete this charging station?')) return
    await deleteStation(id)
    loadStations()
  }

  async function handleAddPort(e) {
    e.preventDefault()
    if (!managingPortsStation) return
    await createPort(managingPortsStation.id, {
      id: newPort.id,
      type: newPort.type,
      powerKw: parseInt(newPort.powerKw),
      pricePerKwh: parseFloat(newPort.pricePerKwh),
      status: newPort.status,
      waitMins: 0,
    })
    setNewPort({ id: `p${Date.now() % 1000}`, type: 'DC Fast', powerKw: 60, pricePerKwh: 18, status: 'available' })
    const updated = await getStations()
    setStations(updated)
    const current = updated.find((s) => s.id === managingPortsStation.id)
    setManagingPortsStation(current)
  }

  async function handleDeletePort(stationId, portId) {
    await deletePort(stationId, portId)
    const updated = await getStations()
    setStations(updated)
    const current = updated.find((s) => s.id === stationId)
    setManagingPortsStation(current)
  }

  const filtered = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {/* Top breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link to="/admin" className="flex items-center gap-1 hover:text-text-primary">
          <ArrowLeft size={16} />
          Back to Admin Dashboard
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Manage Charging Stations</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Configure nationwide hubs, GPS coordinates, power ratings, and charging ports.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-base transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          Add Station
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 max-w-md">
        <Search size={16} className="text-text-secondary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by station name, city, or street..."
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
        />
      </div>

      {/* Stations Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="border-b border-border bg-elevated/50 font-mono text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-5 py-3.5">Station Details</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Ports</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-secondary">
                    Loading charging infrastructure...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-secondary">
                    No charging stations found matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-elevated/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-text-primary">{s.name}</div>
                      <div className="font-mono text-xs text-text-secondary/80">ID: {s.id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-text-primary">{s.city}</div>
                      <div className="truncate max-w-xs text-xs text-text-secondary">{s.address}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={s.status} waitMins={s.waitMins} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setManagingPortsStation(s)}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-elevated px-2.5 py-1 font-mono text-xs text-accent hover:border-accent"
                      >
                        <Zap size={12} />
                        {s.ports.length} Port{s.ports.length !== 1 ? 's' : ''}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="rounded-lg p-1.5 text-text-secondary hover:bg-elevated hover:text-text-primary"
                          title="Edit Station"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteStation(s.id)}
                          className="rounded-lg p-1.5 text-text-secondary hover:bg-danger/10 hover:text-danger"
                          title="Delete Station"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add / Edit Station */}
      {(isAddOpen || editingStation) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-text-primary">
                {editingStation ? 'Edit Station' : 'Add New Charging Station'}
              </h2>
              <button
                onClick={() => {
                  setIsAddOpen(false)
                  setEditingStation(null)
                }}
                className="text-text-secondary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStation} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary">Station Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Bandra Kurla Power Hub"
                  required
                  className="mt-1 w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary">City</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Mumbai"
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary">Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary">Full Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, Landmark, Area..."
                  required
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary">
                  Amenities (comma-separated)
                </label>
                <input
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  placeholder="Cafe, WiFi, Restroom"
                  className="mt-1 w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false)
                    setEditingStation(null)
                  }}
                  className="rounded-xl border border-border px-4 py-2 text-sm text-text-secondary hover:bg-elevated"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-base hover:opacity-90"
                >
                  {editingStation ? 'Update Station' : 'Create Station'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Port Management Drawer */}
      {managingPortsStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-text-primary">
                  Charger Ports · {managingPortsStation.name}
                </h2>
                <p className="text-xs text-text-secondary">{managingPortsStation.city}</p>
              </div>
              <button
                onClick={() => setManagingPortsStation(null)}
                className="text-text-secondary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            {/* Current Ports */}
            <div className="mt-4 space-y-2">
              <h3 className="font-mono text-xs uppercase text-text-secondary">Configured Ports</h3>
              {managingPortsStation.ports.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-elevated p-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-accent">{p.id}</span>
                    <span className="text-text-primary">{p.type}</span>
                    <span className="rounded bg-elevated2 px-2 py-0.5 font-mono text-[11px] text-text-secondary">
                      {p.powerKw} kW
                    </span>
                    <span className="font-mono text-text-secondary">₹{p.pricePerKwh}/kWh</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 capitalize text-[10px] font-semibold ${
                        p.status === 'available'
                          ? 'bg-success/15 text-success'
                          : p.status === 'waiting'
                          ? 'bg-warning/15 text-warning'
                          : 'bg-danger/15 text-danger'
                      }`}
                    >
                      {p.status}
                    </span>
                    <button
                      onClick={() => handleDeletePort(managingPortsStation.id, p.id)}
                      className="text-text-secondary hover:text-danger"
                      title="Remove Port"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Port Form */}
            <form onSubmit={handleAddPort} className="mt-6 border-t border-border pt-4">
              <h3 className="font-mono text-xs uppercase text-text-secondary mb-3">Add Additional Port</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="block text-[11px] text-text-secondary">Port ID</label>
                  <input
                    value={newPort.id}
                    onChange={(e) => setNewPort({ ...newPort, id: e.target.value })}
                    placeholder="p4"
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-elevated px-2.5 py-1.5 text-xs text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-text-secondary">Type</label>
                  <select
                    value={newPort.type}
                    onChange={(e) => setNewPort({ ...newPort, type: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-elevated px-2 py-1.5 text-xs text-text-primary focus:border-accent focus:outline-none"
                  >
                    <option value="DC Fast">DC Fast</option>
                    <option value="AC Type 2">AC Type 2</option>
                    <option value="CCS 2">CCS 2</option>
                    <option value="CHAdeMO">CHAdeMO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-text-secondary">Power (kW)</label>
                  <input
                    type="number"
                    value={newPort.powerKw}
                    onChange={(e) => setNewPort({ ...newPort, powerKw: e.target.value })}
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-elevated px-2.5 py-1.5 text-xs text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-text-secondary">Price (₹/kWh)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newPort.pricePerKwh}
                    onChange={(e) => setNewPort({ ...newPort, pricePerKwh: e.target.value })}
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-elevated px-2.5 py-1.5 text-xs text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-base hover:opacity-90"
                >
                  <Plus size={14} />
                  Add Port to Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

