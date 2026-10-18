// Strings shared by every page, and the address of each page in both languages.
export type Lang = 'ar' | 'en';

export const SOLUTION_SLUGS = ['training-simulation', 'immersive-learning', 'interactive-xr'] as const;

/** `/x/` in Arabic, `/en/x/` in English. */
export const href = (lang: Lang, path = '') => (lang === 'en' ? '/en/' : '/') + path.replace(/^\//, '');

/** The same page in the other language. */
export const otherLang = (lang: Lang, pathname: string) =>
  lang === 'en' ? pathname.replace(/^\/en(\/|$)/, '/') : '/en' + pathname;

export const CONTACT = {
  email: 'info@autoxtion.com',
  phones: ['+966 56 235 6520', '+966 54 946 6436'],
  whatsapp: '966562356520',
  cc: 'bedourahmadal@gmail.com,b.alayyad@autoxtion.com',
};

export const UI = {
  ar: {
    dir: 'rtl',
    home: 'AUTOXTION — الرئيسية',
    skip: 'تخط إلى المحتوى',
    nav: 'القائمة الرئيسية',
    menu: 'القائمة',
    solutions: 'الحلول',
    sectors: 'القطاعات',
    about: 'من نحن',
    contact: 'تواصل معنا',
    consulting: 'الاستشارات والبرامج المهنية',
    solutionNames: {
      'training-simulation': 'التدريب والمحاكاة الغامرة',
      'immersive-learning': 'التعلم الغامر',
      'interactive-xr': 'التجارب التفاعلية بالواقع الممتد',
    },
    other: 'EN',
    otherName: 'English',
    company: 'الشركة',
    reach: 'تواصل',
    city: 'الرياض، المملكة العربية السعودية',
    blurb: 'AUTOXTION شركة سعودية تصمم وتطور تجارب غامرة ذكية، مقرها الرياض.',
    rights: 'جميع الحقوق محفوظة',
    whatsapp: 'راسلنا عبر واتساب',
    whatsappText: 'مرحبا AUTOXTION، أرغب بالتعرف على خدماتكم.',
    details: 'التفاصيل',
    cc: 'رمز الدولة',
    required: 'هذا الحقل مطلوب',
    badEmail: 'أدخل بريدًا إلكترونيًا صحيحًا، مثل name@company.com',
    pick: 'اختر من القائمة',
    ok: 'وصل طلبك، وسنتواصل معك قريبا.',
    error: 'تعذر الإرسال. حاول مرة أخرى أو راسلنا عبر واتساب.',
    optional: '(اختياري)',
  },
  en: {
    dir: 'ltr',
    home: 'AUTOXTION — Home',
    skip: 'Skip to content',
    nav: 'Main navigation',
    menu: 'Menu',
    solutions: 'Solutions',
    sectors: 'Sectors',
    about: 'About',
    contact: 'Contact us',
    consulting: 'Consulting & Professional Programs',
    solutionNames: {
      'training-simulation': 'Immersive Training & Simulation',
      'immersive-learning': 'Immersive Learning',
      'interactive-xr': 'Interactive XR Experiences',
    },
    other: 'عربي',
    otherName: 'العربية',
    company: 'Company',
    reach: 'Contact',
    city: 'Riyadh, Saudi Arabia',
    blurb: 'AUTOXTION is a Saudi company that designs and develops intelligent immersive experiences, based in Riyadh.',
    rights: 'All rights reserved',
    whatsapp: 'Message us on WhatsApp',
    whatsappText: 'Hello AUTOXTION, I would like to learn more about your work.',
    details: 'Details',
    cc: 'Country code',
    required: 'This field is required',
    badEmail: 'Enter a valid email address, such as name@company.com',
    pick: 'Choose from the list',
    ok: 'Your request has been received. We will be in touch shortly.',
    error: 'Sending failed. Please try again or message us on WhatsApp.',
    optional: '(optional)',
  },
} as const;
