import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = String(process.env.EXPO_PUBLIC_SUPABASE_URL)
// const supabaseAnonKey = String(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)

const supabaseUrl = "https://mosrzootwtqzcuqgczwb.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vc3J6b290d3RxemN1cWdjendiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNDk0NTgsImV4cCI6MjA1OTcyNTQ1OH0.rNaotxv4gUxb-WwRW0XSuW2zfYvsYq2VbfB674lny5k"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})