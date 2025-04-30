import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';

interface Ingredient {
  name: string;
  category: string;
  user_id: string;
  quantity: number;
  mfg: string;
  exp: string;
  image_url: string;
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchIngredients = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No user session');
      }

      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('user_id', session.user.id)
        .order('mfg', { ascending: false });

      if (error) {
        throw error;
      }

      setIngredients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching ingredients');
    }
  }, []);

  useEffect(() => {
    let subscription: any = null;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    async function setupRealtime() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('No user session');
        }

        // Initial fetch
        await fetchIngredients();

        // Set up realtime subscription
        subscription = supabase
          .channel('ingredients_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'ingredients',
              filter: `user_id=eq.${session.user.id}`
            },
            (payload) => {
              console.log('Realtime update:', payload);
              if (payload.eventType === 'INSERT') {
                setIngredients(prev => [payload.new as Ingredient, ...prev]);
              } else if (payload.eventType === 'UPDATE') {
                setIngredients(prev => 
                  prev.map(ingredient => 
                    ingredient.name === (payload.new as Ingredient).name 
                      ? payload.new as Ingredient 
                      : ingredient
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                setIngredients(prev => 
                  prev.filter(ingredient => 
                    ingredient.name !== (payload.old as Ingredient).name
                  )
                );
              }
            }
          )
          .subscribe((status) => {
            console.log('Subscription status:', status);
            setIsConnected(status === 'SUBSCRIBED');
            
            if (status === 'CHANNEL_ERROR') {
              if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying subscription (${retryCount}/${maxRetries})...`);
                setTimeout(setupRealtime, retryDelay);
              } else {
                setError('Failed to establish realtime connection after multiple attempts');
              }
            }
          });

        return () => {
          if (subscription) {
            subscription.unsubscribe();
          }
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while setting up realtime');
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }

    setupRealtime();

    // Cleanup function
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchIngredients]);

  return { ingredients, loading, error, isConnected, refetch: fetchIngredients };
}

export async function addIngredient(ingredient: Omit<Ingredient, 'user_id'>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('No user session');
  }

  const { data, error } = await supabase
    .from('ingredients')
    .insert([{ ...ingredient, user_id: session.user.id }])
    .select();

  if (error) {
    throw error;
  }

  return data?.[0];
}

export async function updateIngredient(name: string, updates: Partial<Ingredient>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('No user session');
  }

  const { data, error } = await supabase
    .from('ingredients')
    .update(updates)
    .eq('name', name)
    .eq('user_id', session.user.id)
    .select();

  if (error) {
    throw error;
  }

  return data?.[0];
}

export async function deleteIngredient(name: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('No user session');
  }

  const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('name', name)
    .eq('user_id', session.user.id);

  if (error) {
    throw error;
  }
}
