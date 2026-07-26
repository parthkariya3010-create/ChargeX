import { useEffect, useState } from 'react'
import { UserCircle2, Save, CheckCircle2 } from 'lucide-react'
import { getProfile, updateProfile } from '../services/api'

const FIELD_CLASS =
  'mt-1.5 w-full rounded-lg border border-border bg-elevated px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-accent focus:outline-none'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getProfile().then(setProfile)
  }, [])

  function update(path, value) {
    setSaved(false)
    setProfile((prev) => {
      const next = { ...prev }
      if (path[0] === 'vehicle') {
        next.vehicle = { ...next.vehicle, [path[1]]: value }
      } else {
        next[path[0]] = value
      }
      return next
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    await updateProfile(profile)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!profile) {
    return <div className="mx-auto max-w-2xl px-5 py-10 text-text-secondary">Loading profile…</div>
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <UserCircle2 size={24} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">{profile.name}</h1>
          <p className="text-sm text-text-secondary">{profile.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-8 space-y-6">
        <fieldset className="rounded-2xl border border-border bg-surface p-5">
          <legend className="px-1 font-display text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Contact details
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-text-secondary">
              Full name
              <input className={FIELD_CLASS} value={profile.name} onChange={(e) => update(['name'], e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-text-secondary">
              Email
              <input className={FIELD_CLASS} type="email" value={profile.email} onChange={(e) => update(['email'], e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-text-secondary sm:col-span-2">
              Phone
              <input className={FIELD_CLASS} value={profile.phone} onChange={(e) => update(['phone'], e.target.value)} />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-border bg-surface p-5">
          <legend className="px-1 font-display text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Vehicle details
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-text-secondary">
              Make
              <input className={FIELD_CLASS} value={profile.vehicle?.make ?? ''} onChange={(e) => update(['vehicle', 'make'], e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-text-secondary">
              Model
              <input className={FIELD_CLASS} value={profile.vehicle?.model ?? ''} onChange={(e) => update(['vehicle', 'model'], e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-text-secondary">
              Registration number
              <input
                className={`${FIELD_CLASS} font-mono`}
                value={profile.vehicle?.regNumber ?? ''}
                onChange={(e) => update(['vehicle', 'regNumber'], e.target.value)}
              />
            </label>
            <label className="block text-xs font-medium text-text-secondary">
              Connector type
              <select
                className={FIELD_CLASS}
                value={profile.vehicle?.connectorType ?? ''}
                onChange={(e) => update(['vehicle', 'connectorType'], e.target.value)}
              >
                <option>AC Type 2</option>
                <option>DC Fast</option>
                <option>CCS2</option>
                <option>CHAdeMO</option>
              </select>
            </label>
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 size={15} />
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
