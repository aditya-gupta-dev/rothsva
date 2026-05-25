import { useState } from 'react'
import { useAuth } from '../providers/auth-context'
import { useFabPosition } from '../providers/fab-position-context'
import { useReferenceData } from '../providers/reference-data-context'
import { Button } from '../ui/components/button'
import { Card } from '../ui/components/card'
import { createCategory } from '../lib/api'
import { Plus, Tag, Layers } from 'lucide-react'

export function SettingsPage() {
  const { logout, user, token } = useAuth()
  const { position, setPosition } = useFabPosition()
  const { isLoading, refresh, mainCategories, subCategories } = useReferenceData()
  
  // New Category State
  const [newParentName, setNewParentName] = useState('')
  const [isAddingParent, setIsAddingParent] = useState(false)
  
  const [newSubName, setNewSubName] = useState('')
  const [selectedParentId, setSelectedParentId] = useState('')
  const [isAddingSub, setIsAddingSub] = useState(false)

  async function handleRefresh() {
    try {
      await refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unable to refresh local data.')
    }
  }

  async function handleAddParent(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = newParentName.trim()

    if (!token) {
      alert('You must be logged in to add a category.')
      return
    }

    if (!trimmedName) {
      alert('Main category name is required.')
      return
    }

    setIsAddingParent(true)
    try {
      await createCategory(trimmedName, null, token)
      setNewParentName('')
      await refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add category.')
    } finally {
      setIsAddingParent(false)
    }
  }

  async function handleAddSub(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = newSubName.trim()

    if (!token) {
      alert('You must be logged in to add a sub-category.')
      return
    }

    if (!selectedParentId) {
      alert('Parent category is required.')
      return
    }

    if (!trimmedName) {
      alert('Sub-category name is required.')
      return
    }

    setIsAddingSub(true)
    try {
      await createCategory(trimmedName, Number(selectedParentId), token)
      setNewSubName('')
      setSelectedParentId('')
      await refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add sub-category.')
    } finally {
      setIsAddingSub(false)
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-8 pb-20">
      <header className="pt-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Settings
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-heading)] sm:text-5xl">
          General
        </h1>
      </header>

      {/* Account & Appearance */}
      <Card className="rounded-[36px] p-6 sm:p-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Account
              </p>
              <div className="mt-4 space-y-3">
                <InfoItem label="Name" value={user?.name} />
                <InfoItem label="Email" value={user?.email} />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                FAB Position
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {(['left', 'center', 'right'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPosition(option)}
                    className={`min-h-11 rounded-full px-5 text-sm font-semibold capitalize tracking-[-0.01em] transition-all ${
                      position === option
                        ? 'bg-[var(--color-text)] text-[var(--color-canvas)] shadow-md scale-105'
                        : 'border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text)] hover:border-[var(--color-border-strong)]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-panel-subtle)] p-6 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
              Data Controls
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
              Refresh categories, merchants, and payment modes stored in local cache.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? 'Refreshing...' : 'Refresh Cached Data'}
              </Button>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Categories Management */}
      <div className="space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            Organization
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-heading)]">
            Categories
          </h2>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Add Parent Category */}
          <Card className="rounded-[36px] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <Tag size={20} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-heading)]">New Main Category</h3>
            </div>
            <form onSubmit={handleAddParent} className="space-y-4">
              <input
                type="text"
                value={newParentName}
                onChange={(e) => setNewParentName(e.target.value)}
                placeholder="Category name (e.g. Health)"
                className="w-full min-h-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-input)] px-4 text-base outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[color:rgba(0,113,227,0.14)] transition-all"
                disabled={isAddingParent || isLoading}
                required
              />
              <Button type="submit" className="w-full" disabled={isAddingParent || isLoading}>
                <Plus size={18} className="mr-2" />
                {isAddingParent ? 'Adding...' : 'Add Main Category'}
              </Button>
            </form>
          </Card>

          {/* Add Sub Category */}
          <Card className="rounded-[36px] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                <Layers size={20} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-heading)]">New Sub-category</h3>
            </div>
            <form onSubmit={handleAddSub} className="space-y-4">
              <select
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="w-full min-h-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-input)] px-4 text-base outline-none focus:border-[var(--color-accent)] transition-all"
                disabled={isAddingSub || isLoading}
                required
              >
                <option value="">Select parent category</option>
                {mainCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="Sub-category name (e.g. Gym)"
                className="w-full min-h-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-input)] px-4 text-base outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[color:rgba(0,113,227,0.14)] transition-all"
                disabled={isAddingSub || isLoading}
                required
              />
              <Button type="submit" className="w-full" disabled={isAddingSub || isLoading}>
                <Plus size={18} className="mr-2" />
                {isAddingSub ? 'Adding...' : 'Add Sub-category'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Existing Categories Preview */}
        <Card className="rounded-[36px] p-6 sm:p-8">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)] mb-6">
            Existing Hierarchy
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mainCategories.map((main) => (
              <div key={main.id} className="rounded-2xl border border-[var(--color-border)] p-4 bg-[var(--color-panel-subtle)]">
                <p className="font-bold text-[var(--color-heading)] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  {main.name}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {subCategories
                    .filter((sub) => sub.parentId === main.id)
                    .map((sub) => (
                      <span key={sub.id} className="px-2.5 py-1 rounded-full bg-[var(--color-panel-strong)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-muted)]">
                        {sub.name}
                      </span>
                    ))}
                  {subCategories.filter((sub) => sub.parentId === main.id).length === 0 && (
                    <span className="text-[10px] italic text-[var(--color-muted)]">No sub-categories</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}

function InfoItem({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <p className="text-xs text-[var(--color-muted)] font-medium">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-[var(--color-heading)]">{value || 'Not set'}</p>
    </div>
  )
}
