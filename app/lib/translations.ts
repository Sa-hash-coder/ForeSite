export type Language = "en" | "hi";

export interface Translations {
  // Navigation & Common
  appTitle: string;
  workerName: string;
  home: string;
  reportIssue: string;
  myReports: string;
  languageBtn: string;
  footerText: string;
  backToReports: string;
  loading: string;
  error: string;

  // Danger Levels
  dangerLevels: {
    LOW: { label: string; sub: string };
    MEDIUM: { label: string; sub: string };
    HIGH: { label: string; sub: string };
    CRITICAL: { label: string; sub: string };
  };

  // Status Labels
  status: {
    pending_analysis: string;
    analysis_complete: string;
    under_review: string;
    action_assigned: string;
    resolved: string;
    closed: string;
  };

  // Dashboard
  greeting: string;
  greetingSub: string;
  reportBtnTitle: string;
  reportBtnSub: string;
  statTotal: string;
  statPending: string;
  statResolved: string;
  recentReports: string;
  seeAll: string;
  noReportsYet: string;
  noReportsSub: string;

  // Submit Form
  submitTitle: string;
  submitSubtitle: string;
  whatHappened: string;
  whatHappenedHint: string;
  whatHappenedPlaceholder: string;
  describeIssue: string;
  describeHint: string;
  describePlaceholder: string;
  locationLabel: string;
  selectLocation: string;
  issueTypeLabel: string;
  categories: Record<string, string>;
  severityLabel: string;
  severities: Record<string, { title: string; desc: string }>;
  photoLabel: string;
  photoHint: string;
  photoBtn: string;
  removePhoto: string;
  submitBtn: string;
  submitting: string;
  submitSuccessTitle: string;
  submitSuccessMsg: string;
  viewMyReports: string;
  submitAnother: string;

  // Validation errors
  errTitle: string;
  errDesc: string;
  errLocation: string;
  errCategory: string;
  errSeverity: string;
  errPhotoSize: string;

  // Report Details
  dangerLevelTitle: string;
  suggestionsTitle: string;
  reportedDetailsTitle: string;
  actionTakenTitle: string;
  assignedTo: string;
  dueDate: string;
  checkingStatus: string;
  checkingStatusSub: string;

  // Locations
  locations: string[];
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: "ForeSite",
    workerName: "Rajan",
    home: "🏠 Home",
    reportIssue: "📋 Report Hazard",
    myReports: "📁 My Reports",
    languageBtn: "हिंदी में बदलें",
    footerText: "ForeSite Safety Platform • Report hazards immediately to stay safe",
    backToReports: "← Back to My Reports",
    loading: "Loading...",
    error: "Something went wrong. Please check your connection.",

    dangerLevels: {
      LOW: { label: "Low Danger", sub: "Minor issue • Stay alert" },
      MEDIUM: { label: "Medium Danger", sub: "Take caution • Needs attention" },
      HIGH: { label: "High Danger", sub: "Serious risk • Keep safe distance" },
      CRITICAL: { label: "Severe Danger", sub: "Immediate threat • Do not enter area" },
    },

    status: {
      pending_analysis: "Reviewing...",
      analysis_complete: "Verified",
      under_review: "Officer Checking",
      action_assigned: "Fix In Progress",
      resolved: "Fixed & Safe ✓",
      closed: "Closed",
    },

    greeting: "Hello, Rajan 👋",
    greetingSub: "Safety first. If you see danger, report it immediately.",
    reportBtnTitle: "Report a Hazard / Danger",
    reportBtnSub: "Tap here to submit a quick safety report",
    statTotal: "Total Reports",
    statPending: "In Progress",
    statResolved: "Fixed & Safe",
    recentReports: "Recent Reports",
    seeAll: "See All →",
    noReportsYet: "No reports yet",
    noReportsSub: "When you report an issue, it will appear here.",

    submitTitle: "Report a Hazard",
    submitSubtitle: "Fill in simple details. We will alert the safety team immediately.",
    whatHappened: "What is the problem? *",
    whatHappenedHint: "Short title (e.g. Broken wire near water pump)",
    whatHappenedPlaceholder: "e.g. Open live wire near water",
    describeIssue: "Details / Location details *",
    describeHint: "What danger do you see? Who is at risk?",
    describePlaceholder: "Describe the danger briefly...",
    locationLabel: "Where is it located? *",
    selectLocation: "-- Select Location --",
    issueTypeLabel: "Type of Danger *",
    categories: {
      near_miss: "Near Miss (Close Call)",
      unsafe_condition: "Unsafe Condition / Place",
      unsafe_act: "Unsafe Work / Practice",
      equipment_failure: "Machine / Tool Breakdown",
      chemical_exposure: "Gas / Chemical Leak",
      other: "Other Problem",
    },
    severityLabel: "How dangerous is it? *",
    severities: {
      low: { title: "LOW", desc: "Minor issue, low chance of harm" },
      medium: { title: "MEDIUM", desc: "Can cause injury if ignored" },
      high: { title: "HIGH", desc: "Can cause serious injury" },
      critical: { title: "CRITICAL", desc: "Life-threatening / immediate danger" },
    },
    photoLabel: "Attach Photo (Optional)",
    photoHint: "A picture helps the repair team fix it faster",
    photoBtn: "📷 Take or Pick a Photo",
    removePhoto: "✕ Remove Photo",
    submitBtn: "Send Report Now",
    submitting: "Sending...",
    submitSuccessTitle: "Report Sent Successfully!",
    submitSuccessMsg: "The safety team has been alerted. You can track repairs under My Reports.",
    viewMyReports: "View My Reports",
    submitAnother: "Report Another Issue",

    errTitle: "Please enter a title (at least 5 letters).",
    errDesc: "Please enter a short description (at least 15 letters).",
    errLocation: "Please select a location.",
    errCategory: "Please choose the type of danger.",
    errSeverity: "Please select danger level.",
    errPhotoSize: "Photo is too large. Please select a smaller photo.",

    dangerLevelTitle: "Danger Level",
    suggestionsTitle: "Safety Advice & Next Steps",
    reportedDetailsTitle: "What was reported",
    actionTakenTitle: "Repair & Action Progress",
    assignedTo: "Assigned To",
    dueDate: "Expected Fix Date",
    checkingStatus: "Safety team is reviewing...",
    checkingStatusSub: "The report is being processed. Action will be assigned shortly.",

    locations: [
      "Boiler Room A",
      "Boiler Room B",
      "Chemical Storage Area",
      "Control Room",
      "Electrical Panel Room",
      "Loading Bay",
      "Maintenance Workshop",
      "Roof / Height Work Area",
      "Water Treatment Plant",
      "Warehouse",
      "Other Location",
    ],
  },

  hi: {
    appTitle: "फ़ोरसाइट (ForeSite)",
    workerName: "राजन",
    home: "🏠 मुख्य पृष्ठ",
    reportIssue: "📋 ख़तरा दर्ज करें",
    myReports: "📁 मेरी रिपोर्ट्स",
    languageBtn: "Switch to English",
    footerText: "फ़ोरसाइट सुरक्षा मंच • सुरक्षित रहने के लिए तुरंत ख़तरा दर्ज करें",
    backToReports: "← वापस मेरी रिपोर्ट्स पर जाएं",
    loading: "लोड हो रहा है...",
    error: "कुछ गड़बड़ हुई। कृपया इंटरनेट कनेक्शन जांचें।",

    dangerLevels: {
      LOW: { label: "कम ख़तरा (Low)", sub: "मामूली समस्या • सतर्क रहें" },
      MEDIUM: { label: "मध्यम ख़तरा (Medium)", sub: "सावधानी बरतें • ध्यान देने योग्य" },
      HIGH: { label: "भारी ख़तरा (High)", sub: "गंभीर ख़तरा • सुरक्षित दूरी बनाए रखें" },
      CRITICAL: { label: "अत्यधिक ख़तरा (Critical)", sub: "जानलेवा ख़तरा • तुरंत दूर हटें" },
    },

    status: {
      pending_analysis: "जांच जारी है...",
      analysis_complete: "सत्यापित",
      under_review: "अधिकारी जांच रहे हैं",
      action_assigned: "सुधार कार्य जारी है",
      resolved: "ठीक हो गया (सुरक्षित) ✓",
      closed: "बंद",
    },

    greeting: "नमस्ते, राजन 👋",
    greetingSub: "सुरक्षा सबसे पहले। अगर कोई ख़तरा दिखे, तुरंत सूचित करें।",
    reportBtnTitle: "ख़तरा / समस्या दर्ज करें",
    reportBtnSub: "नई रिपोर्ट भेजने के लिए यहाँ दबाएं",
    statTotal: "कुल रिपोर्ट्स",
    statPending: "प्रगति पर",
    statResolved: "ठीक और सुरक्षित",
    recentReports: "हालिया रिपोर्ट्स",
    seeAll: "सभी देखें →",
    noReportsYet: "अभी तक कोई रिपोर्ट नहीं है",
    noReportsSub: "जब आप कोई समस्या दर्ज करेंगे, वह यहाँ दिखाई देगी।",

    submitTitle: "नया ख़तरा दर्ज करें",
    submitSubtitle: "सरल जानकारी भरें। सुरक्षा टीम को तुरंत संदेश भेजा जाएगा।",
    whatHappened: "क्या समस्या है? *",
    whatHappenedHint: "संक्षिप्त नाम (जैसे: पानी के पास खुला तार)",
    whatHappenedPlaceholder: "उदा. पानी के पास बिजली का खुला तार",
    describeIssue: "कहाँ और क्या ख़तरा है? *",
    describeHint: "क्या ख़तरा है? क्या किसी को चोट लग सकती है?",
    describePlaceholder: "समस्या का थोड़ा विवरण लिखें...",
    locationLabel: "स्थान कहाँ है? *",
    selectLocation: "-- स्थान चुनें --",
    issueTypeLabel: "ख़तरे का प्रकार *",
    categories: {
      near_miss: "हादसा होते-होते बचा (Near Miss)",
      unsafe_condition: "असुरक्षित जगह / स्थिति",
      unsafe_act: "असुरक्षित काम / तरीका",
      equipment_failure: "मशीन / उपकरण की खराबी",
      chemical_exposure: "गैस / केमिकल रिसाव",
      other: "अन्य समस्या",
    },
    severityLabel: "ख़तरा कितना बड़ा है? *",
    severities: {
      low: { title: "कम (Low)", desc: "हल्की समस्या, चोट लगने की संभावना कम" },
      medium: { title: "मध्यम (Medium)", desc: "ध्यान न देने पर चोट लग सकती है" },
      high: { title: "ज़्यादा (High)", desc: "गंभीर चोट लग सकती है" },
      critical: { title: "गंभीर (Critical)", desc: "जानलेवा / तुरंत ख़तरा" },
    },
    photoLabel: "फ़ोटो जोड़ें (ऐच्छिक)",
    photoHint: "फ़ोटो देखकर टीम जल्दी समझ और ठीक कर पाएगी",
    photoBtn: "📷 फ़ोटो खींचें या चुनें",
    removePhoto: "✕ फ़ोटो हटाएं",
    submitBtn: "रिपोर्ट भेजें",
    submitting: "भेजा जा रहा है...",
    submitSuccessTitle: "रिपोर्ट सफलतापूर्वक दर्ज हो गई!",
    submitSuccessMsg: "सुरक्षा टीम को सूचित कर दिया गया है। आप 'मेरी रिपोर्ट्स' में स्थिति देख सकते हैं।",
    viewMyReports: "मेरी रिपोर्ट्स देखें",
    submitAnother: "एक और रिपोर्ट दर्ज करें",

    errTitle: "कृपया समस्या का नाम लिखें (कम से कम 5 अक्षर)।",
    errDesc: "कृपया विवरण लिखें (कम से कम 15 अक्षर)।",
    errLocation: "कृपया स्थान चुनें।",
    errCategory: "कृपया ख़तरे का प्रकार चुनें।",
    errSeverity: "कृपया ख़तरे का स्तर चुनें।",
    errPhotoSize: "फ़ोटो का आकार बहुत बड़ा है। कृपया छोटी फ़ोटो चुनें।",

    dangerLevelTitle: "ख़तरे का स्तर (Danger Level)",
    suggestionsTitle: "सुरक्षा निर्देश एवं सुझाव (What to do)",
    reportedDetailsTitle: "दर्ज की गई समस्या",
    actionTakenTitle: "सुधार व कार्रवाई की स्थिति",
    assignedTo: "किसे सौंपा गया",
    dueDate: "सुधार की अंतिम तिथि",
    checkingStatus: "सुरक्षा टीम जांच कर रही है...",
    checkingStatusSub: "आपकी रिपोर्ट पर जल्द ही कार्रवाई शुरू होगी।",

    locations: [
      "बॉयलर रूम A (Boiler Room A)",
      "बॉयलर रूम B (Boiler Room B)",
      "केमिकल स्टोरेज (Chemical Storage)",
      "कंट्रोल रूम (Control Room)",
      "इलेक्ट्रिकल पैनल रूम (Electrical Room)",
      "लोडिंग बे (Loading Bay)",
      "मेंटेनेंस वर्कशॉप (Workshop)",
      "छत / ऊंचाई कार्य क्षेत्र (Roof / Height)",
      "वाटर ट्रीटमेंट प्लांट (Water Treatment)",
      "वेयरहाउस / गोदाम (Warehouse)",
      "अन्य स्थान (Other Location)",
    ],
  },
};
