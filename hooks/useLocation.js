'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE, startLocationSimulation, MOCK_PERSON } from '@/lib/mockHardware'

export function useLocation(personId) {
  const [location, setLocation] = useState(null)
  const [history,  setHistory]  = useState([])

  useEffect(() => {
    const id = personId || MOCK_PERSON.id

    // ── MOCK MODE ─────────────────────────────────────────────
    if (MOCK_MODE) {
      const stop = startLocationSimulation((loc) => {
        setLocation(loc)
        setHistory(prev => [...prev.slice(-49), loc])
      })
      return stop
    }

    // ── REAL MODE ─────────────────────────────────────────────
    // 1. Fetch last known location immediately on load
    supabase
      .from('locations')
      .select('lat, lng, accuracy, created_at')
      .eq('person_id', id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!data || data.length === 0) return
        // Most recent first in DB, reverse for history order
        const ordered = [...data].reverse()
        setHistory(ordered.map(d => ({ lat: d.lat, lng: d.lng })))
        setLocation(ordered[ordered.length - 1])
      })

    // 2. Subscribe to new inserts via Supabase Realtime
    const channel = supabase
      .channel(`location-${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'locations', filter: `person_id=eq.${id}` },
        (payload) => {
          const loc = payload.new
          setLocation(loc)
          setHistory(prev => [...prev.slice(-49), { lat: loc.lat, lng: loc.lng }])
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [personId])

  return { location, history }
}
