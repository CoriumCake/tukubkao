import { supabase } from './supabase';
import { scheduleNotification } from './notifications';

interface Ingredient {
  name: string;
  exp: string;
}

export async function checkExpiringIngredients() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('No user session');
    }

    // Get current date and date 3 days from now
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Query ingredients that will expire in the next 3 days
    const { data: expiringIngredients, error } = await supabase
      .from('ingredients')
      .select('name, exp')
      .eq('user_id', session.user.id)
      .lte('exp', threeDaysFromNow.toISOString().split('T')[0])
      .gt('exp', now.toISOString().split('T')[0]);

    if (error) {
      throw error;
    }

    if (expiringIngredients && expiringIngredients.length > 0) {
      // Group ingredients by expiration date
      const groupedIngredients = expiringIngredients.reduce((acc: { [key: string]: string[] }, ingredient) => {
        const expDate = new Date(ingredient.exp).toLocaleDateString();
        if (!acc[expDate]) {
          acc[expDate] = [];
        }
        acc[expDate].push(ingredient.name);
        return acc;
      }, {});

      // Send notifications for each expiration date
      for (const [date, ingredients] of Object.entries(groupedIngredients)) {
        await scheduleNotification(
          'Ingredients Expiring Soon',
          `The following ingredients will expire on ${date}: ${ingredients.join(', ')}`,
          {
            type: 'timeInterval',
            seconds: 1, // Send immediately
          }
        );
      }
    }
  } catch (error) {
    console.error('Error checking expiring ingredients:', error);
  }
} 