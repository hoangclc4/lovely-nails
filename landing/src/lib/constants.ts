export const PHONE_NUMBER = '+16716466244';

export const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Reviews', href: '#reviews' },
] as const;

export const STATS = [
  { number: '5+', label: 'Expert Technicians', animateTo: null },
  { number: '2,400+', label: 'Happy Clients', animateTo: 2400 },
  { number: '50+', label: 'Nail Services', animateTo: 50 },
  { number: '4.9★', label: 'Average Rating', animateTo: 4.9 },
] as const;

export const SERVICE_CATEGORIES = ['All', 'Manicure', 'Pedicure', 'Kids', 'Waxing', 'Add-on'] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

// Manicure images — each service gets a unique photo
const IMG_SOLAR = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80';
const IMG_ACRYLIC_GEL = 'https://images.unsplash.com/photo-1610992015762-45dca7fa3a85?w=600&q=80';
const IMG_ACRYLIC_FULL = 'https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?w=600&q=80';
const IMG_WHITE_NAILS = 'https://images.unsplash.com/photo-1633955726992-2b7c0d2d2a69?w=600&q=80';
const IMG_GLITTER_MANI = 'https://images.pexels.com/photos/17010955/pexels-photo-17010955.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';
const IMG_OMBRE_GEL = 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&q=80';
const IMG_RED_MANI = 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=600&q=80';

// Pedicure images
const IMG_FLORAL_PEDI = 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&q=80';
const IMG_GEL_PEDI = 'https://images.unsplash.com/photo-1664643411326-6c589531be3c?w=600&q=80';
const IMG_SEA_SALT = 'https://images.pexels.com/photos/19695949/pexels-photo-19695949.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';
const IMG_PEDI_CLOSE = 'https://images.pexels.com/photos/17056221/pexels-photo-17056221.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';
const IMG_SPA_PEDI = 'https://images.pexels.com/photos/15949785/pexels-photo-15949785.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';
const IMG_RED_TOES = 'https://images.unsplash.com/photo-1707725238063-0c54fb6963d1?w=600&q=80';
const IMG_FOOT_MASSAGE = 'https://images.pexels.com/photos/6187855/pexels-photo-6187855.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';

// Kids images
const IMG_KIDS_PEDI_Y = 'https://images.pexels.com/photos/5999083/pexels-photo-5999083.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';
const IMG_KIDS_MANI_Y = 'https://images.unsplash.com/photo-1690749138086-7422f71dc159?w=600&q=80';
const IMG_KIDS_PEDI_O = 'https://images.pexels.com/photos/5999071/pexels-photo-5999071.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';
const IMG_KIDS_MANI_O = 'https://images.unsplash.com/photo-1690749138086-7422f71dc159?w=600&q=80';

// Waxing images — one per treatment area
const IMG_LEG_WAX = 'https://images.pexels.com/photos/6763618/pexels-photo-6763618.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';
const IMG_UNDERARM_WAX = 'https://images.pexels.com/photos/15764070/pexels-photo-15764070.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';
const IMG_BROW_WAX = 'https://images.pexels.com/photos/6135615/pexels-photo-6135615.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';
const IMG_CHIN_WAX = 'https://images.pexels.com/photos/8184259/pexels-photo-8184259.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';
const IMG_LIP_WAX = 'https://images.pexels.com/photos/7290083/pexels-photo-7290083.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';

// Add-on images
const IMG_POLISH_CHG = 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&q=80';
const IMG_ACRYLIC_REM = 'https://images.pexels.com/photos/3997340/pexels-photo-3997340.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';
const IMG_GEL_REM = 'https://images.pexels.com/photos/6135675/pexels-photo-6135675.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';
const IMG_NAIL_REPAIR = 'https://images.pexels.com/photos/3997385/pexels-photo-3997385.jpeg?auto=compress&cs=tinysrgb&w=600&q=80';
const IMG_FRENCH = 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80';

export const SERVICES: {
  name: string;
  category: ServiceCategory;
  description: string;
  price: string;
  duration: string;
  imageUrl: string;
  imageAlt: string;
}[] = [
  // Manicure
  { name: 'Solar Nails (Pink & White)', category: 'Manicure', description: 'High-quality pink and white acrylic for a permanent French look.', price: '$50', duration: '60 min', imageUrl: IMG_SOLAR, imageAlt: 'Solar Nails' },
  { name: 'Solar / Acrylic Gel', category: 'Manicure', description: 'Acrylic or Solar powder with a shiny gel top coat finish.', price: '$45', duration: '50 min', imageUrl: IMG_ACRYLIC_GEL, imageAlt: 'Acrylic Gel' },
  { name: 'Acrylic Full Set', category: 'Manicure', description: 'Standard acrylic nail extensions for added length and strength.', price: '$35', duration: '45 min', imageUrl: IMG_ACRYLIC_FULL, imageAlt: 'Acrylic Full Set' },
  { name: 'Solar / Acrylic Refill', category: 'Manicure', description: 'Maintenance for Solar or Gel-powder sets.', price: '$35', duration: '40 min', imageUrl: IMG_WHITE_NAILS, imageAlt: 'Acrylic Refill' },
  { name: 'Acrylic Refill', category: 'Manicure', description: 'Standard maintenance for grown-out acrylic nails.', price: '$25', duration: '35 min', imageUrl: IMG_GLITTER_MANI, imageAlt: 'Acrylic Refill' },
  { name: 'Manicure Gel', category: 'Manicure', description: 'Basic manicure with long-lasting LED-cured gel polish.', price: '$30', duration: '35 min', imageUrl: IMG_OMBRE_GEL, imageAlt: 'Gel Manicure' },
  { name: 'Regular Manicure', category: 'Manicure', description: 'Traditional cleaning, shaping, and regular polish.', price: '$20', duration: '25 min', imageUrl: IMG_RED_MANI, imageAlt: 'Regular Manicure' },

  // Pedicure
  { name: 'Deluxe Pedicure', category: 'Pedicure', description: 'Premium foot care including masks, hot towels, and extended massage.', price: '$50', duration: '60 min', imageUrl: IMG_FLORAL_PEDI, imageAlt: 'Deluxe Pedicure' },
  { name: 'Gel Pedicure', category: 'Pedicure', description: 'Foot care finished with durable, shiny gel polish.', price: '$37', duration: '45 min', imageUrl: IMG_GEL_PEDI, imageAlt: 'Gel Pedicure' },
  { name: 'Pedicure w/ Sea Salt', category: 'Pedicure', description: 'Spa pedicure featuring a sea salt scrub for exfoliation.', price: '$32', duration: '40 min', imageUrl: IMG_SEA_SALT, imageAlt: 'Sea Salt Pedicure' },
  { name: 'Pedicure w/ Callous Remover', category: 'Pedicure', description: 'Specialized treatment to soften and remove heel callouses.', price: '$32', duration: '40 min', imageUrl: IMG_PEDI_CLOSE, imageAlt: 'Callous Remover Pedicure' },
  { name: 'Spa Pedicure', category: 'Pedicure', description: 'Standard foot soak, cleaning, scrub, and massage.', price: '$25', duration: '30 min', imageUrl: IMG_SPA_PEDI, imageAlt: 'Spa Pedicure' },
  { name: 'Express Pedicure', category: 'Pedicure', description: 'Quick cleaning and polish change for feet.', price: '$20', duration: '20 min', imageUrl: IMG_RED_TOES, imageAlt: 'Express Pedicure' },
  { name: 'Foot Massage', category: 'Pedicure', description: 'Focused massage on feet and lower legs.', price: '$15', duration: '15 min', imageUrl: IMG_FOOT_MASSAGE, imageAlt: 'Foot Massage' },

  // Kids
  { name: 'Kids Spa Pedicure (under 8)', category: 'Kids', description: 'Gentle foot care and polish for children under 8.', price: '$15', duration: '20 min', imageUrl: IMG_KIDS_PEDI_Y, imageAlt: 'Kids Pedicure' },
  { name: 'Kids Manicure (under 8)', category: 'Kids', description: 'Gentle hand care and polish for children under 8.', price: '$12', duration: '15 min', imageUrl: IMG_KIDS_MANI_Y, imageAlt: 'Kids Manicure' },
  { name: 'Kids Spa Pedicure (8 & over)', category: 'Kids', description: 'Foot care for older children (8 and over).', price: '$20', duration: '25 min', imageUrl: IMG_KIDS_PEDI_O, imageAlt: 'Kids Pedicure' },
  { name: 'Kids Manicure (8 & over)', category: 'Kids', description: 'Hand care for older children (8 and over).', price: '$15', duration: '20 min', imageUrl: IMG_KIDS_MANI_O, imageAlt: 'Kids Manicure' },

  // Waxing
  { name: 'Full Leg (Knee down)', category: 'Waxing', description: 'Hair removal from the knees to the ankles.', price: '$40', duration: '30 min', imageUrl: IMG_LEG_WAX, imageAlt: 'Leg Wax' },
  { name: 'Underarm Wax', category: 'Waxing', description: 'Professional hair removal for the underarms.', price: '$18', duration: '15 min', imageUrl: IMG_UNDERARM_WAX, imageAlt: 'Underarm Wax' },
  { name: 'Eyebrow Wax', category: 'Waxing', description: 'Shaping and cleaning of the eyebrow area.', price: '$10', duration: '10 min', imageUrl: IMG_BROW_WAX, imageAlt: 'Eyebrow Wax' },
  { name: 'Chin Wax', category: 'Waxing', description: 'Hair removal for the chin area.', price: '$10', duration: '10 min', imageUrl: IMG_CHIN_WAX, imageAlt: 'Chin Wax' },
  { name: 'Lip Wax', category: 'Waxing', description: 'Quick hair removal for the upper lip.', price: '$5', duration: '5 min', imageUrl: IMG_LIP_WAX, imageAlt: 'Lip Wax' },

  // Add-on
  { name: 'Polish Change', category: 'Add-on', description: 'Removal of old polish and application of new color.', price: '$10', duration: '10 min', imageUrl: IMG_POLISH_CHG, imageAlt: 'Polish Change' },
  { name: 'Nail Removal (Solar/Acrylic)', category: 'Add-on', description: 'Safe professional soak-off of artificial enhancements.', price: '$10', duration: '20 min', imageUrl: IMG_ACRYLIC_REM, imageAlt: 'Nail Removal' },
  { name: 'Nail Removal (Gel/Shellac)', category: 'Add-on', description: 'Professional removal of gel polish.', price: '$5', duration: '15 min', imageUrl: IMG_GEL_REM, imageAlt: 'Gel Removal' },
  { name: 'Nail Repair', category: 'Add-on', description: 'Fixing a single chipped or broken nail.', price: '$5', duration: '10 min', imageUrl: IMG_NAIL_REPAIR, imageAlt: 'Nail Repair' },
  { name: 'French Tip / Design', category: 'Add-on', description: 'Custom art or white tip finish.', price: '$5', duration: '15 min', imageUrl: IMG_FRENCH, imageAlt: 'French Tip' },
];

export const TAGS = [
  'Solar Nails', 'Acrylic Full Set', 'Gel Manicure', 'Acrylic Refill',
  'Deluxe Pedicure', 'Spa Pedicure', 'Gel Pedicure', 'Kids Manicure',
  'Eyebrow Wax', 'Leg Waxing', 'French Tip', 'Nail Repair',
] as const;

export const ABOUT_FEATURES = [
  {
    icon: '✨',
    title: 'Premium Products',
    description: 'We use only top-tier brands — OPI, CND, Aprés — for lasting quality and vibrant color.',
  },
  {
    icon: '🎨',
    title: 'Personalized Designs',
    description: 'Every client gets a custom consultation. Your nails, your style — we bring your vision to life.',
  },
  {
    icon: '🧼',
    title: 'Hygiene First',
    description: 'Medical-grade sterilization. Individually packaged tools. Your safety is non-negotiable.',
  },
] as const;

export const GALLERY_ITEMS = [
  { imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&q=80', label: 'Rose Gold Chrome', alt: 'Rose gold manicure' },
  { imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500&q=80', label: 'Abstract Art', alt: 'Abstract nail art' },
  { imageUrl: 'https://images.pexels.com/photos/18441298/pexels-photo-18441298.jpeg?auto=compress&cs=tinysrgb&w=500&q=80', label: 'Spa Pedicure', alt: 'Beautician performing pedicure' },
  { imageUrl: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=500&q=80', label: 'Ombré Glitter', alt: 'Ombre glitter nails' },
  { imageUrl: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=500&q=80', label: 'Minimalist Lines', alt: 'Minimalist nail design' },
  { imageUrl: 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=500&q=80', label: 'Classic Red', alt: 'Classic red manicure' },
  { imageUrl: 'https://images.pexels.com/photos/17056221/pexels-photo-17056221.jpeg?auto=compress&cs=tinysrgb&w=500&q=80', label: 'Pedicure Bliss', alt: 'Pedicure close-up' },
  { imageUrl: 'https://images.pexels.com/photos/8652717/pexels-photo-8652717.jpeg?auto=compress&cs=tinysrgb&w=500&q=80', label: 'Kids Special', alt: 'Mother and daughter showing matching red manicure' },
  { imageUrl: 'https://images.pexels.com/photos/10632142/pexels-photo-10632142.jpeg?auto=compress&cs=tinysrgb&w=500&q=80', label: 'Glitter Glam', alt: 'Gold glitter nail art with star decorations' },
  { imageUrl: 'https://images.pexels.com/photos/20758448/pexels-photo-20758448.jpeg?auto=compress&cs=tinysrgb&w=500&q=80', label: 'Pink Paradise', alt: 'Pink manicure with pink flower' },
] as const;

export const HERO_PREVIEWS = [
  'https://images.pexels.com/photos/3997354/pexels-photo-3997354.jpeg?auto=compress&cs=tinysrgb&w=120&q=80',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=120&q=80',
  'https://images.pexels.com/photos/15949785/pexels-photo-15949785.jpeg?auto=compress&cs=tinysrgb&w=120&q=80',
  'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=120&q=80',
  'https://images.pexels.com/photos/6763618/pexels-photo-6763618.jpeg?auto=compress&cs=tinysrgb&w=120&q=80',
] as const;

export const STEPS = [
  { number: '01', title: 'Choose', description: 'Browse our services and pick the perfect treatment for your nails.' },
  { number: '02', title: 'Call', description: 'Give us a call to reserve your spot. We\'ll confirm your appointment right away.' },
  { number: '03', title: 'Relax', description: "Arrive and unwind. We'll take care of everything from start to finish." },
  { number: '04', title: 'Glow', description: 'Leave feeling beautiful and confident with nails that turn heads.' },
] as const;

export const TESTIMONIALS = [
  {
    stars: 5,
    text: '"Best nail salon on the island! Mai did the most gorgeous ombré set I\'ve ever had. The attention to detail is unreal."',
    initials: 'JR',
    name: 'Jessica R.',
    meta: 'Regular client · 2 years',
  },
  {
    stars: 5,
    text: '"I\'ve tried every salon in Guam and nothing compares. The space is so clean and relaxing, and my gel mani lasts 3+ weeks every time."',
    initials: 'ST',
    name: 'Sarah T.',
    meta: 'Regular client · 1 year',
  },
  {
    stars: 5,
    text: '"Got my wedding nails done here and they were absolutely perfect. The whole bridal party was impressed. Thank you Lovely Nails!"',
    initials: 'MK',
    name: 'Maria K.',
    meta: 'Bridal client',
  },
] as const;
