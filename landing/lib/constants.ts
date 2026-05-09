export const BOOKING_URL = 'https://lovelynails.com/book';

export const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Booking', href: '#how' },
  { label: 'Reviews', href: '#reviews' },
] as const;

export const STATS = [
  { number: '5+', label: 'Expert Technicians', animateTo: null },
  { number: '2,400+', label: 'Happy Clients', animateTo: 2400 },
  { number: '50+', label: 'Nail Services', animateTo: 50 },
  { number: '4.9★', label: 'Average Rating', animateTo: 4.9 },
] as const;

export const SERVICES = [
  {
    name: 'Gel Manicure',
    description: 'Long-lasting gel polish with a flawless, high-shine finish that stays beautiful for weeks.',
    price: 'From $35',
    duration: '45 min',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
    imageAlt: 'Gel Manicure',
  },
  {
    name: 'Custom Nail Art',
    description: 'Express your style with hand-painted designs, 3D art, chrome finishes, and seasonal themes.',
    price: 'From $50',
    duration: '60–90 min',
    imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80',
    imageAlt: 'Nail Art',
  },
  {
    name: 'Luxury Spa Pedicure',
    description: 'A full pampering experience with hot stone massage, exfoliation, and moisturizing treatment.',
    price: 'From $55',
    duration: '60 min',
    imageUrl: 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=600&q=80',
    imageAlt: 'Spa Pedicure',
  },
  {
    name: 'Acrylic Full Set',
    description: 'Durable acrylic extensions sculpted to your desired length and shape, with polish of your choice.',
    price: 'From $60',
    duration: '75 min',
    imageUrl: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&q=80',
    imageAlt: 'Acrylic Extensions',
  },
  {
    name: 'Kids Manicure',
    description: 'A fun, safe, and gentle nail experience for little ones — mini spa day just for them!',
    price: 'From $20',
    duration: '30 min',
    imageUrl: 'https://images.pexels.com/photos/4210343/pexels-photo-4210343.jpeg?auto=compress&cs=tinysrgb&w=600&q=80',
    imageAlt: 'Kids Manicure',
  },
  {
    name: 'Waxing',
    description: 'Smooth, long-lasting hair removal with professional-grade wax for legs, brows, and more.',
    price: 'From $15',
    duration: '20–45 min',
    imageUrl: 'https://images.pexels.com/photos/3998013/pexels-photo-3998013.jpeg?auto=compress&cs=tinysrgb&w=600&q=80',
    imageAlt: 'Waxing Service',
  },
] as const;

export const TAGS = [
  'Gel Manicure', 'Acrylic Extensions', 'Nail Art', 'Dip Powder',
  'Spa Pedicure', 'French Tips', 'Chrome Nails', 'Nail Repair',
  'Paraffin Treatment', 'Shellac', 'Ombré Nails', '3D Nail Art',
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
  { imageUrl: 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=500&q=80', label: 'Spa Pedicure', alt: 'Luxury spa pedicure' },
  { imageUrl: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=500&q=80', label: 'Ombré Glitter', alt: 'Ombre glitter nails' },
  { imageUrl: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=500&q=80', label: 'Minimalist Lines', alt: 'Minimalist nail design' },
  { imageUrl: 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=500&q=80', label: 'Classic Red', alt: 'Classic red manicure' },
  { imageUrl: 'https://images.pexels.com/photos/17056221/pexels-photo-17056221.jpeg?auto=compress&cs=tinysrgb&w=500&q=80', label: 'Pedicure Bliss', alt: 'Pedicure close-up' },
  { imageUrl: 'https://images.pexels.com/photos/4210343/pexels-photo-4210343.jpeg?auto=compress&cs=tinysrgb&w=500&q=80', label: 'Kids Special', alt: 'Kids manicure' },
  { imageUrl: 'https://images.pexels.com/photos/4210675/pexels-photo-4210675.jpeg?auto=compress&cs=tinysrgb&w=500&q=80', label: 'Glitter Glam', alt: 'Glitter nail art' },
  { imageUrl: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=500&q=80', label: 'Pink Paradise', alt: 'Pink manicure' },
] as const;

export const HERO_PREVIEWS = [
  'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=120&q=80',
  'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=120&q=80',
  'https://images.pexels.com/photos/4210343/pexels-photo-4210343.jpeg?auto=compress&cs=tinysrgb&w=120&q=80',
  'https://images.pexels.com/photos/4210675/pexels-photo-4210675.jpeg?auto=compress&cs=tinysrgb&w=120&q=80',
  'https://images.pexels.com/photos/3998013/pexels-photo-3998013.jpeg?auto=compress&cs=tinysrgb&w=120&q=80',
] as const;

export const STEPS = [
  { number: '01', title: 'Choose', description: 'Browse our services and pick the perfect treatment for your nails.' },
  { number: '02', title: 'Book', description: "Select your preferred technician, date, and time. We'll confirm instantly." },
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
