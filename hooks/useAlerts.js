'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE, MOCK_ALERTS } from '@/lib/mockHardware'

export function useAlerts(personId) {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    // ── MOCK MODE ───────────────────────────────────────────────
    if (MOCK_MODE) {
      setAlerts(MOCK_ALERTS)
      return
    }

    // ── REAL MODE ───────────────────────────────────────────────
    const id = personId || ''
    if (!id) return

    // 1. Fetch existing alerts
    supabase
      .from('alerts')
      .select('*')
      .eq('person_id', id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setAlerts(data) })

    // 2. Listen for new alerts (SOS button press from ESP32)
    const channel = supabase
      .channel(`alerts-${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts', filter: `person_id=eq.${id}` },
        (payload) => {
          setAlerts(prev => [payload.new, ...prev])

          // Browser push notification to caretaker
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('INSEE — Emergency Alert', {
              body:  'SOS button pressed on the cane. Open dashboard.',
              icon:  '/favicon.ico',
              badge: '/favicon.ico',
            })
          }
        }
      )
      // Listen for severity updates (when person clarifies minor/major)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'alerts', filter: `person_id=eq.${id}` },
        (payload) => {
          setAlerts(prev => prev.map(a => a.id === payload.new.id ? payload.new : a))
        }
      )
      .subscribe()

    // Request notification permission once
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => supabase.removeChannel(channel)
  }, [personId])

  // Used in mock mode to add a simulated alert
  function addMockAlert(alert) {
    setAlerts(prev => [alert, ...prev])
  }

  // Resolve an alert (caretaker marks it done)
  function resolveAlert(alertId) {
    setAlerts(prev =>
      prev.map(a => a.id === alertId
        ? { ...a, status: 'resolved', resolved_at: new Date().toISOString() }
        : a
      )
    )
    if (!MOCK_MODE) {
      supabase
        .from('alerts')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', alertId)
    }
  }

  return { alerts, addMockAlert, resolveAlert }
}
