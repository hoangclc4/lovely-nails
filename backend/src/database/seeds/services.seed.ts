import 'dotenv/config';
import { inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { serviceCategories, services } from '../schema/index';

const CATEGORY_MANICURE = 'Manicure';
const CATEGORY_PEDICURE = 'Pedicure';
const CATEGORY_KIDS = 'Kids';
const CATEGORY_WAXING = 'Waxing';
const CATEGORY_ADDON = 'Add-on';

const SEED_CATEGORIES = [
  { name: CATEGORY_MANICURE, description: 'Hand and nail care services', sortOrder: 1, isActive: true },
  { name: CATEGORY_PEDICURE, description: 'Foot and nail care services', sortOrder: 2, isActive: true },
  { name: CATEGORY_KIDS, description: 'Gentle nail care for children', sortOrder: 3, isActive: true },
  { name: CATEGORY_WAXING, description: 'Professional hair removal services', sortOrder: 4, isActive: true },
  { name: CATEGORY_ADDON, description: 'Add-on enhancements and extras', sortOrder: 5, isActive: true },
] as const;

const SEED_SERVICES: {
  categoryName: string;
  name: string;
  description: string;
  price: string;
  durationMinutes: number;
}[] = [
  // Manicure
  {
    categoryName: CATEGORY_MANICURE,
    name: 'Solar Nails (Pink & White)',
    description: 'High-quality pink and white acrylic for a permanent French look.',
    price: '50.00',
    durationMinutes: 60,
  },
  {
    categoryName: CATEGORY_MANICURE,
    name: 'Solar / Acrylic Gel',
    description: 'Acrylic or Solar powder with a shiny gel top coat finish.',
    price: '45.00',
    durationMinutes: 50,
  },
  {
    categoryName: CATEGORY_MANICURE,
    name: 'Acrylic Full Set',
    description: 'Standard acrylic nail extensions for added length and strength.',
    price: '35.00',
    durationMinutes: 45,
  },
  {
    categoryName: CATEGORY_MANICURE,
    name: 'Solar / Acrylic Refill',
    description: 'Maintenance for Solar or Gel-powder sets.',
    price: '35.00',
    durationMinutes: 40,
  },
  {
    categoryName: CATEGORY_MANICURE,
    name: 'Acrylic Refill',
    description: 'Standard maintenance for grown-out acrylic nails.',
    price: '25.00',
    durationMinutes: 35,
  },
  {
    categoryName: CATEGORY_MANICURE,
    name: 'Manicure Gel',
    description: 'Basic manicure with long-lasting LED-cured gel polish.',
    price: '30.00',
    durationMinutes: 35,
  },
  {
    categoryName: CATEGORY_MANICURE,
    name: 'Regular Manicure',
    description: 'Traditional cleaning, shaping, and regular polish.',
    price: '20.00',
    durationMinutes: 25,
  },

  // Pedicure
  {
    categoryName: CATEGORY_PEDICURE,
    name: 'Deluxe Pedicure',
    description: 'Premium foot care including masks, hot towels, and extended massage.',
    price: '50.00',
    durationMinutes: 60,
  },
  {
    categoryName: CATEGORY_PEDICURE,
    name: 'Gel Pedicure',
    description: 'Foot care finished with durable, shiny gel polish.',
    price: '37.00',
    durationMinutes: 45,
  },
  {
    categoryName: CATEGORY_PEDICURE,
    name: 'Pedicure w/ Sea Salt',
    description: 'Spa pedicure featuring a sea salt scrub for exfoliation.',
    price: '32.00',
    durationMinutes: 40,
  },
  {
    categoryName: CATEGORY_PEDICURE,
    name: 'Pedicure w/ Callous Remover',
    description: 'Specialized treatment to soften and remove heel callouses.',
    price: '32.00',
    durationMinutes: 40,
  },
  {
    categoryName: CATEGORY_PEDICURE,
    name: 'Spa Pedicure',
    description: 'Standard foot soak, cleaning, scrub, and massage.',
    price: '25.00',
    durationMinutes: 30,
  },
  {
    categoryName: CATEGORY_PEDICURE,
    name: 'Express Pedicure',
    description: 'Quick cleaning and polish change for feet.',
    price: '20.00',
    durationMinutes: 20,
  },
  {
    categoryName: CATEGORY_PEDICURE,
    name: 'Foot Massage',
    description: 'Focused massage on feet and lower legs.',
    price: '15.00',
    durationMinutes: 15,
  },

  // Kids
  {
    categoryName: CATEGORY_KIDS,
    name: 'Kids Spa Pedicure (< 8)',
    description: 'Gentle foot care and polish for children under 8.',
    price: '15.00',
    durationMinutes: 20,
  },
  {
    categoryName: CATEGORY_KIDS,
    name: 'Kids Manicure (< 8)',
    description: 'Gentle hand care and polish for children under 8.',
    price: '12.00',
    durationMinutes: 15,
  },
  {
    categoryName: CATEGORY_KIDS,
    name: 'Kids Spa Pedicure (> 8)',
    description: 'Foot care for older children (8 and over).',
    price: '20.00',
    durationMinutes: 25,
  },
  {
    categoryName: CATEGORY_KIDS,
    name: 'Kids Manicure (> 8)',
    description: 'Hand care for older children (8 and over).',
    price: '15.00',
    durationMinutes: 20,
  },

  // Waxing
  {
    categoryName: CATEGORY_WAXING,
    name: 'Full Leg (Knee down)',
    description: 'Hair removal from the knees to the ankles.',
    price: '40.00',
    durationMinutes: 30,
  },
  {
    categoryName: CATEGORY_WAXING,
    name: 'Underarm Wax',
    description: 'Professional hair removal for the underarms.',
    price: '18.00',
    durationMinutes: 15,
  },
  {
    categoryName: CATEGORY_WAXING,
    name: 'Eyebrow Wax',
    description: 'Shaping and cleaning of the eyebrow area.',
    price: '10.00',
    durationMinutes: 10,
  },
  {
    categoryName: CATEGORY_WAXING,
    name: 'Chin Wax',
    description: 'Hair removal for the chin area.',
    price: '10.00',
    durationMinutes: 10,
  },
  {
    categoryName: CATEGORY_WAXING,
    name: 'Lip Wax',
    description: 'Quick hair removal for the upper lip.',
    price: '5.00',
    durationMinutes: 5,
  },

  // Add-on
  {
    categoryName: CATEGORY_ADDON,
    name: 'Polish Change',
    description: 'Removal of old polish and application of new color.',
    price: '10.00',
    durationMinutes: 10,
  },
  {
    categoryName: CATEGORY_ADDON,
    name: 'Nail Removal (Solar/Acrylic)',
    description: 'Safe professional soak-off of artificial enhancements.',
    price: '10.00',
    durationMinutes: 20,
  },
  {
    categoryName: CATEGORY_ADDON,
    name: 'Nail Removal (Gel/Shellac)',
    description: 'Professional removal of gel polish.',
    price: '5.00',
    durationMinutes: 15,
  },
  {
    categoryName: CATEGORY_ADDON,
    name: 'Nail Repair',
    description: 'Fixing a single chipped or broken nail.',
    price: '5.00',
    durationMinutes: 10,
  },
  {
    categoryName: CATEGORY_ADDON,
    name: 'French Tip / Design',
    description: 'Custom art or white tip finish.',
    price: '5.00',
    durationMinutes: 15,
  },
];

async function seed(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema: { serviceCategories, services } });

  console.log('Seeding service categories...');
  const categoryNames = SEED_CATEGORIES.map((c) => c.name);
  const existingCategories = await db
    .select()
    .from(serviceCategories)
    .where(inArray(serviceCategories.name, categoryNames));
  const existingCategoryNames = new Set(existingCategories.map((c) => c.name));

  const newCategories = SEED_CATEGORIES.filter((c) => !existingCategoryNames.has(c.name));
  const insertedCategories =
    newCategories.length > 0
      ? await db.insert(serviceCategories).values(newCategories.map((c) => ({ ...c }))).returning()
      : [];
  console.log(`Inserted ${insertedCategories.length} new categories (${existingCategories.length} already existed).`);

  const categoryMap = new Map(
    [...existingCategories, ...insertedCategories].map((c) => [c.name, c.id]),
  );

  console.log('Seeding services...');
  const serviceNames = SEED_SERVICES.map((s) => s.name);
  const existingServices = await db
    .select()
    .from(services)
    .where(inArray(services.name, serviceNames));
  const existingServiceNames = new Set(existingServices.map((s) => s.name));

  const newServiceRows = SEED_SERVICES.filter((s) => !existingServiceNames.has(s.name)).map(
    ({ categoryName, ...rest }) => ({
      ...rest,
      categoryId: categoryMap.get(categoryName) ?? null,
      isActive: true,
    }),
  );

  const insertedServices =
    newServiceRows.length > 0
      ? await db.insert(services).values(newServiceRows).returning()
      : [];
  console.log(`Inserted ${insertedServices.length} new services (${existingServices.length} already existed).`);

  await pool.end();
  console.log('Done.');
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
