import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

let _cache = null

export function useOxItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (_cache) { setItems(_cache); setLoading(false); return }
    fetch('/data/ox_items.json')
      .then(r => r.json())
      .then(data => {
        _cache = data
        setItems(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { items, loading }
}

export function useUserStats() {
  const [stats, setStats] = useState({})
  const { user } = useAuth()

  const fetchStats = async () => {
    if (!user) return
    const { data } = await supabase.from('user_stats').select('ox_item_id,correct_count,wrong_count,timeout_count,skip_count,error_count,good_count').eq('user_id', user.id)
    if (data) {
      const map = {}
      data.forEach(r => { map[r.ox_item_id] = r })
      setStats(map)
    }
  }

  useEffect(() => { fetchStats() }, [user])
  return { stats, fetchStats }
}
