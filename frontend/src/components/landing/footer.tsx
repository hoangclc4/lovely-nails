import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const SALON_INFO = {
  name: 'Lovely Nails',
  address: 'Route 16 across micro mall, Harmon, Upper Tumon, Guam',
  phone: '+16716466244',
  email: 'lovelynails@gmail.com',
  hours: [
    { day: 'Monday – Saturday', time: '10:00 AM – 7:00 PM' },
    { day: 'Sunday', time: '12:00 PM – 6:00 PM' },
  ],
} as const;

export async function Footer() {
  const t = await getTranslations('landing');

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-2">
            <span
              className="text-2xl font-semibold text-white block mb-3"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {SALON_INFO.name}
            </span>
            <p className="text-sm text-gray-400 leading-relaxed">{t('footer.tagline')}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('footer.hours')}
            </h4>
            <ul className="space-y-2">
              {SALON_INFO.hours.map((entry) => (
                <li key={entry.day} className="text-sm">
                  <span className="text-gray-400">{entry.day}</span>
                  <br />
                  <span className="text-gray-300">{entry.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>{SALON_INFO.address}</li>
              <li>
                <a
                  href={`tel:${SALON_INFO.phone}`}
                  className="hover:text-white transition-colors"
                >
                  {SALON_INFO.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SALON_INFO.email}`}
                  className="hover:text-white transition-colors"
                >
                  {SALON_INFO.email}
                </a>
              </li>
              <li className="pt-2">
                <Link
                  href="/login"
                  className="text-gray-500 hover:text-gray-300 transition-colors text-xs"
                >
                  {t('footer.adminLink')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-500">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
