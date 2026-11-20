/**
 * Minimal i18n layer for YatraGo.
 *
 * Scope note: this translates the shared chrome — navigation, footer, and key
 * calls to action — plus the app's own copy. User-generated content (ride names,
 * addresses, chat messages) is intentionally left untouched.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
  { code: 'bn', name: 'Bangla', native: 'বাংলা', dir: 'ltr' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', native: 'اردو', dir: 'rtl' }
];

const MESSAGES = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.rideServices': 'Ride Services',
    'nav.splitFare': 'Split Fare',
    'nav.business': 'Business & Promos',
    'nav.explore': 'Explore & 3D',
    'nav.workspaces': 'Workspaces',
    'nav.searchPlaceholder': 'Search route or airport…',
    'nav.wallet': 'Wallet',
    'nav.sos': 'SOS',
    // Footer
    'footer.tagline': 'Zero-Emission Urban & Intercity Transit',
    'footer.helpCenter': 'Visit Help Center & Safety Hub',
    'footer.language': 'Language',
    // Booking
    'booking.requestRide': 'Request a ride',
    'booking.pickup': 'Pickup location',
    'booking.destination': 'Where to? (Destination)',
    'booking.pickupPlaceholder': 'Search pickup location...',
    'booking.destPlaceholder': 'Search any destination...',
    'booking.nearestResults': 'Nearest results',
    'booking.locationRequired': 'Location required',
    'booking.selectBoth': 'Please select your pickup and destination places to request a ride.',
    'booking.selectPickup': 'Please select your pickup place to request a ride.',
    'booking.selectDestination': 'Please select your destination place to request a ride.',
    'booking.request': 'Request',
    'booking.reserve': 'Reserve',
    // Wallet
    'wallet.title': 'Mobility Wallet',
    'wallet.balance': 'Available Balance',
    'wallet.addMoney': 'Add Money',
    'wallet.topUp': 'Quick Top-Up',
    'wallet.transactions': 'Recent Transactions',
    'wallet.noTransactions': 'No transactions yet',
    // SOS
    'sos.title': 'Emergency Safety Center & Local SOS',
    'sos.launch': 'Launch Emergency SOS',
    'sos.contacts': 'Primary Emergency Contacts',
    'sos.radius': 'Broadcast Radius',
    // Future scope
    'future.title': 'Future Scope',
    'future.subtitle': 'Ongoing development — additional features being built to help you travel better'
  },
  hi: {
    'nav.home': 'होम',
    'nav.rideServices': 'राइड सेवाएँ',
    'nav.splitFare': 'किराया बाँटें',
    'nav.business': 'व्यवसाय और ऑफ़र',
    'nav.explore': 'अन्वेषण और 3D',
    'nav.workspaces': 'कार्यक्षेत्र',
    'nav.searchPlaceholder': 'रूट या एयरपोर्ट खोजें…',
    'nav.wallet': 'वॉलेट',
    'nav.sos': 'एसओएस',
    'footer.tagline': 'शून्य-उत्सर्जन शहरी और अंतर-शहरी परिवहन',
    'footer.helpCenter': 'सहायता केंद्र और सुरक्षा हब',
    'footer.language': 'भाषा',
    'booking.requestRide': 'राइड का अनुरोध करें',
    'booking.pickup': 'पिकअप स्थान',
    'booking.destination': 'कहाँ जाना है? (गंतव्य)',
    'booking.pickupPlaceholder': 'पिकअप स्थान खोजें...',
    'booking.destPlaceholder': 'कोई गंतव्य खोजें...',
    'booking.nearestResults': 'निकटतम परिणाम',
    'booking.locationRequired': 'स्थान आवश्यक है',
    'booking.selectBoth': 'राइड का अनुरोध करने के लिए कृपया पिकअप और गंतव्य स्थान चुनें।',
    'booking.selectPickup': 'राइड का अनुरोध करने के लिए कृपया अपना पिकअप स्थान चुनें।',
    'booking.selectDestination': 'राइड का अनुरोध करने के लिए कृपया अपना गंतव्य स्थान चुनें।',
    'booking.request': 'अनुरोध करें',
    'booking.reserve': 'बुक करें',
    'wallet.title': 'मोबिलिटी वॉलेट',
    'wallet.balance': 'उपलब्ध शेष राशि',
    'wallet.addMoney': 'पैसे जोड़ें',
    'wallet.topUp': 'त्वरित टॉप-अप',
    'wallet.transactions': 'हाल के लेनदेन',
    'wallet.noTransactions': 'अभी कोई लेनदेन नहीं',
    'sos.title': 'आपातकालीन सुरक्षा केंद्र और स्थानीय एसओएस',
    'sos.launch': 'आपातकालीन एसओएस शुरू करें',
    'sos.contacts': 'प्राथमिक आपातकालीन संपर्क',
    'sos.radius': 'प्रसारण त्रिज्या',
    'future.title': 'भविष्य की योजना',
    'future.subtitle': 'निरंतर विकास — आपकी बेहतर यात्रा के लिए अतिरिक्त सुविधाएँ बनाई जा रही हैं'
  }
};

/**
 * Translates a key. Falls back to English, then to the key itself, so a
 * missing translation can never break the UI.
 */
export function translate(lang, key) {
  return MESSAGES[lang]?.[key] ?? MESSAGES.en[key] ?? key;
}

export function getLanguageMeta(code) {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
}
