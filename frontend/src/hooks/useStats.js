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
    const { data: ex } = await supabase.from('user_stats').select('*').eq('user_id', user.id).eq('ox_item_id', itemId).single()
    const updates = {
      user_id: user.id, ox_item_id: itemId, last_answered_at: now,
      correct_count: (ex?.correct_count ?? 0) + (isCorrect ? 1 : 0),
      wrong_count: (ex?.wrong_count ?? 0) + (!isCorrect && !isSkip && !isTimeout ? 1 : 0),
      timeout_count: (ex?.timeout_count ?? 0) + (isTimeout ? 1 : 0),
      skip_count: (ex?.skip_count ?? 0) + (isSkip ? 1 : 0),
      total_time_ms: (ex?.total_time_ms ?? 0) + (timeMs || 0),
      error_count: ex?.error_count ?? 0,
      good_count: ex?.good_count ?? 0,
      ...(isCorrect ? { last_correct_at: now } : {}),
      ...(!isCorrect && !isSkip ? { last_wrong_at: now } : {}),
    }
    await supabase.from('user_stats').upsert(updates, { onConflict: 'user_id,ox_item_id' })
  }, [user])

  const recordFeedback = useCallback(async (itemId, type) => {
    if (!user) return
    const { data: ex } = await supabase.from('user_stats').select('*').eq('user_id', user.id).eq('ox_item_id', itemId).single()
    const col = type === 'error' ? 'error_count' : 'good_count'
    const updates = {
      user_id: user.id, ox_item_id: itemId,
      correct_count: ex?.correct_count ?? 0,
      wrong_count: ex?.wrong_count ?? 0,
      timeout_count: ex?.timeout_count ?? 0,
      skip_count: ex?.skip_count ?? 0,
      total_time_ms: ex?.total_time_ms ?? 0,
      error_count: (ex?.error_count ?? 0) + (type === 'error' ? 1 : 0),
      good_count: (ex?.good_count ?? 0) + (type === 'good' ? 1 : 0),
    }
    await supabase.from('user_stats').upsert(updates, { onConflict: 'user_id,ox_item_id' })
  }, [user])

  const resetStats = useCallback(async () => {
    if (!user) return
    await supabase.from('user_stats').update({
      correct_count: 0, wrong_count: 0, timeout_count: 0, skip_count: 0,
      total_time_ms: 0, error_count: 0, good_count: 0,
      last_answered_at: null, last_correct_at: null, last_wrong_at: null,
    }).eq('user_id', user.id)
  }, [user])

  return { recordAnswer, recordFeedback, resetStats }
}
