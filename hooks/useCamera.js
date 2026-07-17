'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE, startCameraSimulation } from '@/lib/mockHardware'

export function useCamera(personId, isActive = false) {
  const [frameUrl, setFrameUrl] = useState(null)
  const stopRef = useRef(null)

  useEffect(() => {
    if (!isActive) {
      if (stopRef.current) stopRef.current()
      setFrameUrl(null)
      return
    }

    if (MOCK_MODE) {
      stopRef.current = startCameraSimulation(setFrameUrl)
      return () => stopRef.current?.()
    }

    // ── Real mode: poll Supabase Storage every 3s ──
    // (Pi uploads frames as `camera/${personId}/latest.jpg` with upsert)
    const interval = setInterval(async () => {
      const { data } = supabase.storage
        .from('camera-feed')
        .getPublicUrl(`live/${personId}.jpg`)
      // Bust cache with timestamp
      setFrameUrl(`${data.publicUrl}?t=${Date.now()}`)
    }, 3000)

    return () => clearInterval(interval)
  }, [personId, isActive])

  return frameUrl
}
