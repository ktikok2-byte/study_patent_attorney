import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useBookmarks() {
  const { user } = useAuth()
  const [lists, setLists] = useState([])

  const fetchLists = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('bookmark_lists')
      .select('*').eq('user_id', user.id).order('created_at')
    setLists(data ?? [])
    return data ?? []
  }, [user])

  const addList = useCallback(async (name) => {
    if (!user) return
    await supabase.from('bookmark_lists').insert({ user_id: user.id, name })
    await fetchLists()
  }, [user, fetchLists])

  const deleteList = useCallback(async (listId) => {
    if (!user) return
    await supabase.from('bookmarks').delete().eq('bookmark_list_id', listId)
    await supabase.from('bookmark_lists').delete().eq('id', listId)
    await fetchLists()
  }, [user, fetchLists])

  const addBookmark = useCallback(async (itemId, listId) => {
    if (!user) return
    await supabase.from('bookmarks').upsert({
      user_id: user.id, ox_item_id: itemId, bookmark_list_id: listId
    }, { onConflict: 'user_id,ox_item_id,bookmark_list_id' })
  }, [user])

  const removeBookmark = useCallback(async (itemId, listId) => {
    if (!user) return
    await supabase.from('bookmarks').delete()
      .eq('user_id', user.id).eq('ox_item_id', itemId).eq('bookmark_list_id', listId)
  }, [user])

  const getItemBookmarks = useCallback(async (itemId) => {
    if (!user) return []
    const { data } = await supabase.from('bookmarks')
      .select('bookmark_list_id').eq('user_id', user.id).eq('ox_item_id', itemId)
    return data?.map(b => b.bookmark_list_id) ?? []
  }, [user])

  return { lists, fetchLists, addList, deleteList, addBookmark, removeBookmark, getItemBookmarks }
}
