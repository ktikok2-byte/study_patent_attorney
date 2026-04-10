import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useStats() {
  const { user } = useAuth()

  const recordAnswer = useCallback(async (itemId, result, timeMs) => {
    if (!user) return
    const now = new Date().toISOString()
    const isCorrect = result === 'correct'
    const isTimeout = result === 'timeout'
    const isSkip = result === 'skip'

    const { data: existing } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('ox_item_id', itemId)
      .single()

    const updates = {
      user_id: user.id,
      ox_item_id: itemId,
      last_answered_at: now,
      correct_count: (existing?.correct_count ?? 0) + (isCorrect ? 1 : 0),
      wrong_count: (existing?.wrong_count ?? 0) + ((!isCorrect && !isSkip) ? 1 : 0),
      timeout_count: (existing?.timeout_count ?? 0) + (isTimeout ? 1 : 0),
      skip_count: (existing?.skip_count ?? 0) + (isSkip ? 1 : 0),
      total_time_ms: (existing?.total_time_ms ?? 0) + (timeMs || 0),
      ...(isCorrect ? { last_correct_at: now } : {}),
      ...(!isCorrect && !isSkip ? { last_wrong_at: now } : {}),
    }

    await supabase.from('user_stats').upsert(updates, { onConflict: 'user_id,ox_item_id' })
  }, [user])

  const resetStats = useCallback(async (type) => {
    if (!user) return
    const col = type === 'correct' ? { correct_count: 0, last_correct_at: null }
             : type === 'wrong' ? { wrong_count: 0, timeout_count: 0, last_wrong_at: null }
             : { correct_count: 0, wrong_count: 0, timeout_count: 0, skip_count: 0,
                 total_time_ms: 0, last_answered_at: null, last_correct_at: null, last_wrong_at: null }
    await supabase.from('user_stats').update(col).eq('user_id', user.id)
  }, [user])

  return { recordAnswer, resetStats }
}
