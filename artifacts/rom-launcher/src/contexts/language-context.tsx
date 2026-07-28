import { createContext, useContext, useState, useEffect } from 'react';

export type Lang = 'es' | 'en';

const translations = {
  es: {
    // Sidebar
    menu: 'Menú',
    dashboard: 'Dashboard',
    browseRoms: 'Browse ROMs',
    platforms: 'Plataformas',
    downloads: 'Descargas',
    myLibrary: 'Mi Biblioteca',
    newsFeed: 'Noticias',
    tools: 'Herramientas',
    programs: 'Programas',
    emulators: 'Emuladores',
    settings: 'Configuración',
    upgradePlan: 'Mejorar Plan',
    upgradeSub: 'Descargas rápidas y sin límites',
    upgradeNow: 'Mejorar Ahora',
    // Topbar
    searchPlaceholder: 'Buscar...',
    // Notifications
    notifCenter: 'Centro de Notificaciones',
    seeAll: 'Ver Todo',
    today: 'Hoy',
    thisWeek: 'Esta Semana',
    earlier: 'Antes',
    noNotifs: 'Sin notificaciones',
    upToDate: 'Todo está al día',
    timeAgo: 'hace',
    // Profile dropdown
    viewProfile: 'Ver Perfil',
    appearance: 'Apariencia',
    signOut: 'Cerrar Sesión',
    freePlan: 'Plan Free',
    // Help popup
    helpTitle: 'Acerca de NeonROM',
    helpVersion: 'Versión',
    helpDesc: 'Gestor de biblioteca de ROMs con soporte para múltiples plataformas, descarga de ROMs, emuladores y más.',
    helpFeatures: 'Funciones',
    helpFeature1: 'Búsqueda y descarga de ROMs',
    helpFeature2: 'Soporte multi-plataforma',
    helpFeature3: 'Integración con emuladores',
    helpFeature4: 'Gestión de biblioteca personal',
    helpSupport: 'Soporte',
    helpClose: 'Cerrar',
    // Settings – Profile
    profileSection: 'Perfil',
    profileDesc: 'Gestiona tu identidad en NeonROM.',
    infoSection: 'Información',
    usernameLabel: 'Nombre de usuario',
    subscriptionSection: 'Suscripción',
    currentPlan: 'ACTUAL',
    freePlanName: 'Plan Free',
    freePlanDesc: 'Descargas limitadas · Velocidad estándar',
    proPlanName: 'Plan Pro',
    proPlanDesc: 'Descargas ilimitadas · Máxima velocidad',
    upgrade: 'Mejorar',
    notifsSection: 'Notificaciones',
    notifCompleted: 'Descarga completada',
    notifCompletedSub: 'Alerta cuando un ROM termina de descargar',
    notifUpdates: 'Actualizaciones',
    notifUpdatesSub: 'Notificar cuando hay una nueva versión',
    langSection: 'Idioma',
    langDesc: 'Selecciona el idioma de la interfaz de NeonROM.',
    langSpanish: 'Español',
    langEnglish: 'English',
    langSpanishDesc: 'Interfaz en español',
    langEnglishDesc: 'Interface in English',
    // Appearance section title
    appearanceSection: 'Apariencia',
    appearanceDesc: 'Personaliza el estilo visual de NeonROM.',
    // GitHub update popup
    updateAvailable: '¡Actualización disponible!',
    updateSubtitle: 'Hay una nueva versión de UnknownGestor.',
    updateLatest: 'Última versión',
    updateChangelog: 'Ver cambios en GitHub',
    updateDownload: 'Descargar ahora',
    updateDismiss: 'Ya tengo esta versión',
    // Notification release items
    releaseTitle: 'Nueva versión publicada',
    releaseSub: 'UnknownGestor',
  },
  en: {
    // Sidebar
    menu: 'Menu',
    dashboard: 'Dashboard',
    browseRoms: 'Browse ROMs',
    platforms: 'Platforms',
    downloads: 'Downloads',
    myLibrary: 'My Library',
    newsFeed: 'News Feed',
    tools: 'Tools',
    programs: 'Programs',
    emulators: 'Emulators',
    settings: 'Settings',
    upgradePlan: 'Upgrade Plan',
    upgradeSub: 'Faster downloads & no limits',
    upgradeNow: 'Upgrade Now',
    // Topbar
    searchPlaceholder: 'Search anything...',
    // Notifications
    notifCenter: 'Notification Center',
    seeAll: 'See All',
    today: 'Today',
    thisWeek: 'This Week',
    earlier: 'Earlier',
    noNotifs: 'No notifications',
    upToDate: "You're all caught up",
    timeAgo: 'ago',
    // Profile dropdown
    viewProfile: 'View Profile',
    appearance: 'Appearance',
    signOut: 'Sign Out',
    freePlan: 'Free Plan',
    // Help popup
    helpTitle: 'About NeonROM',
    helpVersion: 'Version',
    helpDesc: 'A ROM library manager with support for multiple platforms, ROM downloads, emulators and more.',
    helpFeatures: 'Features',
    helpFeature1: 'ROM search & download',
    helpFeature2: 'Multi-platform support',
    helpFeature3: 'Emulator integration',
    helpFeature4: 'Personal library management',
    helpSupport: 'Support',
    helpClose: 'Close',
    // Settings – Profile
    profileSection: 'Profile',
    profileDesc: 'Manage your NeonROM identity.',
    infoSection: 'Information',
    usernameLabel: 'Username',
    subscriptionSection: 'Subscription',
    currentPlan: 'CURRENT',
    freePlanName: 'Free Plan',
    freePlanDesc: 'Limited downloads · Standard speed',
    proPlanName: 'Pro Plan',
    proPlanDesc: 'Unlimited downloads · Max speed',
    upgrade: 'Upgrade',
    notifsSection: 'Notifications',
    notifCompleted: 'Download completed',
    notifCompletedSub: 'Alert when a ROM finishes downloading',
    notifUpdates: 'Updates',
    notifUpdatesSub: 'Notify when a new version is available',
    langSection: 'Language',
    langDesc: 'Select the language for the NeonROM interface.',
    langSpanish: 'Español',
    langEnglish: 'English',
    langSpanishDesc: 'Interface in Spanish',
    langEnglishDesc: 'Interface in English',
    // Appearance section title
    appearanceSection: 'Appearance',
    appearanceDesc: 'Customize the visual style of NeonROM.',
    // GitHub update popup
    updateAvailable: 'Update Available!',
    updateSubtitle: 'A new version of UnknownGestor is out.',
    updateLatest: 'Latest version',
    updateChangelog: 'View changelog on GitHub',
    updateDownload: 'Download now',
    updateDismiss: 'I already have this version',
    // Notification release items
    releaseTitle: 'New version released',
    releaseSub: 'UnknownGestor',
  },
} as const;

type TranslationKey = keyof typeof translations.es;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangCtx>({
  lang: 'es',
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const v = localStorage.getItem('neonrom-settings-lang');
      return v === 'en' || v === 'es' ? v : 'es';
    } catch {
      return 'es';
    }
  });

  function setLang(l: Lang) {
    localStorage.setItem('neonrom-settings-lang', l);
    setLangState(l);
  }

  function t(key: TranslationKey): string {
    return translations[lang][key] as string;
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
