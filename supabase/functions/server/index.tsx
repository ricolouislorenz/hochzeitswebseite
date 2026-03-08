import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// AI function to categorize food items
async function categorizeFoodItem(foodName: string): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!apiKey) {
    console.log('OpenAI API Key nicht gefunden, verwende Standard-Kategorie');
    return 'Hauptspeise';
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Experte für Essenskategorisierung. Kategorisiere das genannte Gericht in genau eine dieser Kategorien: "Vorspeise", "Hauptspeise", oder "Nachspeise". Antworte NUR mit dem exakten Kategorienamen, nichts anderes.'
          },
          {
            role: 'user',
            content: `Kategorisiere dieses Gericht: ${foodName}`
          }
        ],
        temperature: 0.3,
        max_tokens: 20,
      }),
    });

    if (!response.ok) {
      console.log(`OpenAI API Fehler: ${response.status}`);
      return 'Hauptspeise';
    }

    const data = await response.json();
    const category = data.choices[0]?.message?.content?.trim() || 'Hauptspeise';
    
    // Validierung: Stelle sicher, dass die Kategorie eine der erwarteten ist
    const validCategories = ['Vorspeise', 'Hauptspeise', 'Nachspeise'];
    if (validCategories.includes(category)) {
      console.log(`KI-Kategorisierung: "${foodName}" -> ${category}`);
      return category;
    } else {
      console.log(`Ungültige Kategorie "${category}" für "${foodName}", verwende Hauptspeise`);
      return 'Hauptspeise';
    }
  } catch (error) {
    console.log(`Fehler bei der KI-Kategorisierung: ${error}`);
    return 'Hauptspeise';
  }
}

// Generate unique 7-digit code
function generateGuestCode(): string {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

// Check if code already exists
async function isCodeUnique(code: string): Promise<boolean> {
  // Admin code is reserved
  if (code === '1807225') {
    return false;
  }
  try {
    const guest = await kv.get(`guest:${code}`);
    // kv.get returns undefined/null when key doesn't exist
    return !guest;
  } catch (error) {
    console.log(`Error checking code uniqueness: ${error}`);
    // If there's an error, assume code might not be unique to be safe
    return false;
  }
}

// Generate unique guest code
async function generateUniqueGuestCode(): Promise<string> {
  let code = generateGuestCode();
  let attempts = 0;
  
  console.log('Starting to generate unique guest code...');
  
  while (!(await isCodeUnique(code)) && attempts < 100) {
    console.log(`Code ${code} already exists, generating new one... (attempt ${attempts + 1})`);
    code = generateGuestCode();
    attempts++;
  }
  
  if (attempts >= 100) {
    console.log('Failed to generate unique code after 100 attempts');
    throw new Error('Failed to generate unique code after 100 attempts');
  }
  
  console.log(`Generated unique code: ${code} after ${attempts} attempts`);
  return code;
}

// Health check endpoint
app.get("/make-server-bda29bfd/health", (c) => {
  return c.json({ status: "ok" });
});

// Admin: Create guest
app.post("/make-server-bda29bfd/admin/guests", async (c) => {
  try {
    const { name, isPlural, gender } = await c.req.json();
    
    if (!name) {
      console.log('Guest creation failed: Name is required');
      return c.json({ error: 'Name is required' }, 400);
    }

    const code = await generateUniqueGuestCode();
    
    const guest = {
      code,
      name,
      isPlural: isPlural || false,
      gender: gender || 'male', // 'male', 'female', or 'plural'
      createdAt: new Date().toISOString(),
    };

    await kv.set(`guest:${code}`, guest);
    
    console.log(`Guest created successfully: ${code} - ${name} (${isPlural ? 'plural' : 'singular'}, ${gender})`);
    return c.json({ success: true, guest });
  } catch (error) {
    console.log(`Error creating guest: ${error}`);
    return c.json({ error: 'Failed to create guest', details: String(error) }, 500);
  }
});

// Guest: Login with code
app.post("/make-server-bda29bfd/guest/login", async (c) => {
  try {
    const { code } = await c.req.json();
    
    if (!code || code.length !== 7) {
      return c.json({ error: 'Invalid code format' }, 400);
    }

    // Check if it's the admin code
    if (code === '1807225') {
      return c.json({ success: true, isAdmin: true });
    }

    const guest = await kv.get(`guest:${code}`);
    
    if (!guest) {
      return c.json({ error: 'Invalid code' }, 401);
    }

    console.log(`Guest login successful: ${code}`);
    return c.json({ success: true, guest, isAdmin: false });
  } catch (error) {
    console.log(`Error during guest login: ${error}`);
    return c.json({ error: 'Login failed', details: String(error) }, 500);
  }
});

// Guest: Submit RSVP
app.post("/make-server-bda29bfd/guest/rsvp", async (c) => {
  try {
    const { code, attending, numberOfGuests, foodItems, needsAccommodation } = await c.req.json();
    
    if (!code) {
      return c.json({ error: 'Code is required' }, 400);
    }

    const guest = await kv.get(`guest:${code}`);
    if (!guest) {
      return c.json({ error: 'Invalid guest code' }, 404);
    }

    // Kategorisiere jede Speise mit KI
    const categorizedFoodItems = [];
    if (foodItems && foodItems.length > 0) {
      for (const item of foodItems) {
        const category = await categorizeFoodItem(item.name);
        categorizedFoodItems.push({
          ...item,
          category,
        });
      }
    }

    const rsvp = {
      code,
      guestName: guest.name,
      attending: attending ?? false,
      numberOfGuests: numberOfGuests || 0,
      foodItems: categorizedFoodItems,
      needsAccommodation: needsAccommodation ?? false,
      submittedAt: new Date().toISOString(),
    };

    await kv.set(`rsvp:${code}`, rsvp);
    
    console.log(`RSVP submitted successfully for guest: ${code}`);
    return c.json({ success: true, rsvp });
  } catch (error) {
    console.log(`Error submitting RSVP: ${error}`);
    return c.json({ error: 'Failed to submit RSVP', details: String(error) }, 500);
  }
});

// Get RSVP for specific guest
app.get("/make-server-bda29bfd/guest/rsvp/:code", async (c) => {
  try {
    const code = c.req.param('code');
    const rsvp = await kv.get(`rsvp:${code}`);
    
    if (!rsvp) {
      return c.json({ rsvp: null });
    }
    
    return c.json({ success: true, rsvp });
  } catch (error) {
    console.log(`Error fetching RSVP: ${error}`);
    return c.json({ error: 'Failed to fetch RSVP', details: String(error) }, 500);
  }
});

// Get buffet list (all food preferences)
app.get("/make-server-bda29bfd/buffet", async (c) => {
  try {
    const rsvps = await kv.getByPrefix('rsvp:');
    
    // Flatten foodItems array to create individual buffet entries
    const buffetList: any[] = [];
    
    rsvps
      .filter((rsvp: any) => rsvp.attending && rsvp.foodItems && rsvp.foodItems.length > 0)
      .forEach((rsvp: any) => {
        rsvp.foodItems.forEach((item: any, index: number) => {
          buffetList.push({
            guestCode: rsvp.code,
            guestName: rsvp.guestName,
            foodItem: item.name,
            isVegetarian: item.isVegetarian,
            isVegan: item.isVegan,
            category: item.category || 'Hauptspeise',
            numberOfGuests: rsvp.numberOfGuests,
            itemIndex: index,
          });
        });
      });
    
    return c.json({ success: true, buffetList });
  } catch (error) {
    console.log(`Error fetching buffet list: ${error}`);
    return c.json({ error: 'Failed to fetch buffet list', details: String(error) }, 500);
  }
});

// Admin: Get all guests
app.get("/make-server-bda29bfd/admin/guests", async (c) => {
  try {
    const guests = await kv.getByPrefix('guest:');
    return c.json({ success: true, guests });
  } catch (error) {
    console.log(`Error fetching guests: ${error}`);
    return c.json({ error: 'Failed to fetch guests', details: String(error) }, 500);
  }
});

// Admin: Get dashboard stats
app.get("/make-server-bda29bfd/admin/dashboard", async (c) => {
  try {
    const rsvps = await kv.getByPrefix('rsvp:');
    const guests = await kv.getByPrefix('guest:');
    
    const attending = rsvps.filter((rsvp: any) => rsvp.attending);
    const declined = rsvps.filter((rsvp: any) => !rsvp.attending);
    const totalAttendingGuests = attending.reduce((sum: number, rsvp: any) => sum + (rsvp.numberOfGuests || 0), 0);
    
    const stats = {
      totalGuests: guests.length,
      totalResponses: rsvps.length,
      attending: attending.length,
      declined: declined.length,
      pending: guests.length - rsvps.length,
      totalAttendingGuests,
      rsvps: rsvps.map((rsvp: any) => ({
        ...rsvp,
        guestName: rsvp.guestName || 'Unknown',
      })),
    };
    
    return c.json({ success: true, stats });
  } catch (error) {
    console.log(`Error fetching dashboard stats: ${error}`);
    return c.json({ error: 'Failed to fetch dashboard stats', details: String(error) }, 500);
  }
});

// Admin: Delete guest
app.delete("/make-server-bda29bfd/admin/guests/:code", async (c) => {
  try {
    const code = c.req.param('code');
    
    await kv.del(`guest:${code}`);
    await kv.del(`rsvp:${code}`);
    
    console.log(`Guest deleted successfully: ${code}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting guest: ${error}`);
    return c.json({ error: 'Failed to delete guest', details: String(error) }, 500);
  }
});

// Admin: Update guest information (name, code, gender, and RSVP data)
app.post("/make-server-bda29bfd/admin/guests/:code/update", async (c) => {
  try {
    const oldCode = c.req.param('code');
    const { 
      name, 
      newCode, 
      gender,
      // RSVP fields
      numberOfGuests,
      needsAccommodation,
      foodItems
    } = await c.req.json();
    
    // Check if guest exists
    const guest = await kv.get(`guest:${oldCode}`);
    if (!guest) {
      return c.json({ error: 'Guest not found' }, 404);
    }
    
    // If code changed, check new code doesn't exist
    if (newCode && newCode !== oldCode) {
      const existingGuest = await kv.get(`guest:${newCode}`);
      if (existingGuest) {
        return c.json({ error: 'New code already exists' }, 400);
      }
    }
    
    const finalCode = newCode || oldCode;
    
    // Update guest data
    const updatedGuest = {
      code: finalCode,
      name: name || guest.name,
      gender: gender || guest.gender || 'male',
      isPlural: (gender || guest.gender) === 'plural',
      createdAt: guest.createdAt,
    };
    
    // If code changed, delete old entry and create new one
    if (finalCode !== oldCode) {
      await kv.del(`guest:${oldCode}`);
      await kv.set(`guest:${finalCode}`, updatedGuest);
      
      // Also move RSVP if exists
      const rsvp = await kv.get(`rsvp:${oldCode}`);
      if (rsvp) {
        await kv.del(`rsvp:${oldCode}`);
        rsvp.code = finalCode;
        rsvp.guestName = updatedGuest.name;
        await kv.set(`rsvp:${finalCode}`, rsvp);
      }
    } else {
      // Just update the guest
      await kv.set(`guest:${finalCode}`, updatedGuest);
    }
    
    // Update RSVP data if provided
    if (numberOfGuests !== undefined || needsAccommodation !== undefined || foodItems !== undefined) {
      const rsvp = await kv.get(`rsvp:${finalCode}`);
      if (rsvp) {
        // Update RSVP fields
        if (numberOfGuests !== undefined) {
          rsvp.numberOfGuests = numberOfGuests;
        }
        if (needsAccommodation !== undefined) {
          rsvp.needsAccommodation = needsAccommodation;
        }
        if (foodItems !== undefined) {
          rsvp.foodItems = foodItems;
        }
        // Update guest name in RSVP
        rsvp.guestName = updatedGuest.name;
        
        await kv.set(`rsvp:${finalCode}`, rsvp);
      }
    }
    
    console.log(`Guest updated successfully: ${oldCode} -> ${finalCode}`);
    return c.json({ success: true, guest: updatedGuest });
  } catch (error) {
    console.log(`Error updating guest: ${error}`);
    return c.json({ error: 'Failed to update guest', details: String(error) }, 500);
  }
});

// Admin: Reset guest RSVP
app.post("/make-server-bda29bfd/admin/guests/:code/reset", async (c) => {
  try {
    const code = c.req.param('code');
    
    // Check if guest exists
    const guest = await kv.get(`guest:${code}`);
    if (!guest) {
      return c.json({ error: 'Guest not found' }, 404);
    }
    
    // Delete the RSVP
    await kv.del(`rsvp:${code}`);
    
    console.log(`RSVP reset successfully for guest: ${code}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error resetting RSVP: ${error}`);
    return c.json({ error: 'Failed to reset RSVP', details: String(error) }, 500);
  }
});

// Admin: Update buffet item category
app.post("/make-server-bda29bfd/admin/buffet/update-category", async (c) => {
  try {
    const { guestCode, itemIndex, category } = await c.req.json();
    
    if (!guestCode || itemIndex === undefined || !category) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Validate category
    const validCategories = ['Vorspeise', 'Hauptspeise', 'Nachspeise'];
    if (!validCategories.includes(category)) {
      return c.json({ error: 'Invalid category' }, 400);
    }
    
    // Get the RSVP
    const rsvp = await kv.get(`rsvp:${guestCode}`);
    if (!rsvp) {
      return c.json({ error: 'RSVP not found' }, 404);
    }
    
    // Update the category of the specific food item
    if (!rsvp.foodItems || !rsvp.foodItems[itemIndex]) {
      return c.json({ error: 'Food item not found' }, 404);
    }
    
    rsvp.foodItems[itemIndex].category = category;
    
    // Save the updated RSVP
    await kv.set(`rsvp:${guestCode}`, rsvp);
    
    console.log(`Updated category for guest ${guestCode}, item ${itemIndex} to ${category}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating buffet category: ${error}`);
    return c.json({ error: 'Failed to update category', details: String(error) }, 500);
  }
});

// Admin: Update complete buffet item (name, category, properties)
app.post("/make-server-bda29bfd/admin/buffet/update-item", async (c) => {
  try {
    const { guestCode, itemIndex, name, category, isVegetarian, isVegan } = await c.req.json();
    
    if (!guestCode || itemIndex === undefined || !name || !category) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Validate category
    const validCategories = ['Vorspeise', 'Hauptspeise', 'Nachspeise'];
    if (!validCategories.includes(category)) {
      return c.json({ error: 'Invalid category' }, 400);
    }
    
    // Get the RSVP
    const rsvp = await kv.get(`rsvp:${guestCode}`);
    if (!rsvp) {
      return c.json({ error: 'RSVP not found' }, 404);
    }
    
    // Update the complete food item
    if (!rsvp.foodItems || !rsvp.foodItems[itemIndex]) {
      return c.json({ error: 'Food item not found' }, 404);
    }
    
    rsvp.foodItems[itemIndex] = {
      name: name,
      category: category,
      isVegetarian: isVegetarian ?? false,
      isVegan: isVegan ?? false,
    };
    
    // Save the updated RSVP
    await kv.set(`rsvp:${guestCode}`, rsvp);
    
    console.log(`Updated buffet item for guest ${guestCode}, item ${itemIndex}: ${name} (${category})`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating buffet item: ${error}`);
    return c.json({ error: 'Failed to update buffet item', details: String(error) }, 500);
  }
});

// Admin: Delete buffet item
app.post("/make-server-bda29bfd/admin/buffet/delete-item", async (c) => {
  try {
    const { guestCode, itemIndex } = await c.req.json();
    
    if (!guestCode || itemIndex === undefined) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Get the RSVP
    const rsvp = await kv.get(`rsvp:${guestCode}`);
    if (!rsvp) {
      return c.json({ error: 'RSVP not found' }, 404);
    }
    
    // Check if food item exists
    if (!rsvp.foodItems || !rsvp.foodItems[itemIndex]) {
      return c.json({ error: 'Food item not found' }, 404);
    }
    
    const deletedItem = rsvp.foodItems[itemIndex];
    
    // Remove the food item from the array
    rsvp.foodItems.splice(itemIndex, 1);
    
    // Save the updated RSVP
    await kv.set(`rsvp:${guestCode}`, rsvp);
    
    console.log(`Deleted buffet item for guest ${guestCode}, item ${itemIndex}: ${deletedItem.name}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting buffet item: ${error}`);
    return c.json({ error: 'Failed to delete buffet item', details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);