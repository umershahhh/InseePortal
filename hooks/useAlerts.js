'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE, MOCK_ALERTS } from '@/lib/mockHardware'

export function useAlerts(personId) {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    if (MOCK_MODE) {
      setAlerts(MOCK_ALERTS)
      return
    }

    const id = personId || ''
    if (!id) return

    // Initial fetch
    supabase
      .from('alerts')
      .select('*')
      .eq('person_id', id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setAlerts(data) })

    // Realtime — new alert
    const channel = supabase
      .channel(`alerts-${id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'alerts',
        filter: `person_id=eq.${id}`,
      }, (payload) => {
        setAlerts(prev => [payload.new, ...prev])
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('INSEE — Emergency Alert', {
            body: 'SOS button pressed on the cane.',
            icon: '/favicon.ico',
          })
        }
      })
      // Realtime — severity update
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'alerts',
        filter: `person_id=eq.${id}`,
      }, (payload) => {
        setAlerts(prev => prev.map(a => a.id === payload.new.id ? payload.new : a))
      })
      .subscribe()

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => supabase.removeChannel(channel)
  }, [personId])

  // Mock: add a simulated alert
  function addMockAlert(alert) {
    setAlerts(prev => [alert, ...prev])
  }

  // Resolve one alert
  function resolveAlert(alertId) {
    const resolved = { status: 'resolved', resolved_at: new Date().toISOString() }
    setAlerts(prev =>
      prev.map(a => a.id === alertId ? { ...a, ...resolved } : a)
    )
    if (!MOCK_MODE) {
      supabase.from('alerts')
        .update(resolved)
        .eq('id', alertId)
        .then(() => {})
    }
  }

  return { alerts, addMockAlert, resolveAlert }
}
