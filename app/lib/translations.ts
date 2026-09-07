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

  // Simplified Submit Form (Voice-First)
  submitTitle: string;
  submitSubtitle: string;
  locationLabel: string;
  selectLocation: string;
  
  voiceMainTitle: string;
  voiceMainSubtitle: string;
  voiceHoldToSpeak: string;
  voiceTapToSpeak: string;
  voiceListeningNow: string;
  voiceRecordingTimer: string;
  voiceRecordedSuccess: string;
  voiceReRecord: string;
  voiceDelete: string;
  voiceAutoTranscribed: string;

  optionalTextLabel: string;
  optionalTextPlaceholder: string;
  optionalTextHint: string;

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

  // Validation
  errLocation: string;
  errNoInput: string;
  errPhotoSize: string;
  errMicPermission: string;

  // Report Details
  dangerLevelTitle: string;
  suggestionsTitle: string;
  reportedDetailsTitle: string;
  actionTakenTitle: string;
  assignedTo: string;
  dueDate: string;
  listenAdviceBtn: string;
  stopListenAdviceBtn: string;

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
      pending_analysis: "AI Analyzing...",
      analysis_complete: "Verified",
      under_review: "Officer Checking",
      action_assigned: "Fix In Progress",
      resolved: "Fixed & Safe ✓",
      closed: "Closed",
    },

    greeting: "Hello, Rajan 👋",
    greetingSub: "Safety first. If you see danger, report it immediately.",
    reportBtnTitle: "Report a Hazard / Danger",
    reportBtnSub: "Hold the mic to speak or take a photo",
    statTotal: "Total Reports",
    statPending: "In Progress",
    statResolved: "Fixed & Safe",
    recentReports: "Recent Reports",
    seeAll: "See All →",
    noReportsYet: "No reports yet",
    noReportsSub: "When you report an issue, it will appear here.",

    submitTitle: "Report a Hazard",
    submitSubtitle: "Press & hold the mic to speak. Our AI will automatically analyze the danger and alert the team.",
    locationLabel: "1. Where is the danger located? *",
    selectLocation: "-- Select Location --",

    voiceMainTitle: "2. Speak into the microphone (Main)",
    voiceMainSubtitle: "Hold the button and describe what you see. We'll automatically convert it into text.",
    voiceHoldToSpeak: "Press & Hold to Speak",
    voiceTapToSpeak: "Tap or Hold to Speak",
    voiceListeningNow: "🔴 Listening... Speak clearly now",
    voiceRecordingTimer: "Recording",
    voiceRecordedSuccess: "Voice message recorded",
    voiceReRecord: "🔄 Re-record",
    voiceDelete: "✕ Delete Audio",
    voiceAutoTranscribed: "Transcribed from your voice:",

    optionalTextLabel: "3. Extra written notes (Optional)",
    optionalTextPlaceholder: "Your speech appears here automatically. You can also type manually if you prefer...",
    optionalTextHint: "You can leave this blank if you have recorded your voice or added a photo.",

    photoLabel: "4. Add a Photo (Optional)",
    photoHint: "AI analyzes the photo to identify the danger automatically",
    photoBtn: "📷 Take or Pick a Photo",
    removePhoto: "✕ Remove Photo",

    submitBtn: "Send Report Now",
    submitting: "Sending to AI Analysis...",
    submitSuccessTitle: "Report Sent Successfully!",
    submitSuccessMsg: "Your voice & photo have been sent. AI is analyzing the danger level and assigning technicians.",
    viewMyReports: "View My Reports",
    submitAnother: "Report Another Issue",

    errLocation: "Please select where the hazard is located.",
    errNoInput: "Please record your voice, type a description, or attach a photo.",
    errPhotoSize: "Photo is too large. Please choose a photo under 10 MB.",
    errMicPermission: "Microphone permission is required. Please allow mic access.",

    dangerLevelTitle: "Danger Level (AI Assessed)",
    suggestionsTitle: "Safety Advice & Next Steps",
    reportedDetailsTitle: "What was reported",
    actionTakenTitle: "Repair & Action Progress",
    assignedTo: "Assigned To",
    dueDate: "Expected Fix Date",
    listenAdviceBtn: "🔊 Read Aloud (Listen)",
    stopListenAdviceBtn: "⏹️ Stop Voice",

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
      "Warehouse Corridor",
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
      pending_analysis: "AI जांच कर रहा है...",
      analysis_complete: "सत्यापित",
      under_review: "अधिकारी जांच रहे हैं",
      action_assigned: "सुधार कार्य जारी है",
      resolved: "ठीक हो गया (सुरक्षित) ✓",
      closed: "बंद",
    },

    greeting: "नमस्ते, राजन 👋",
    greetingSub: "सुरक्षा सबसे पहले। अगर कोई ख़तरा दिखे, तुरंत सूचित करें।",
    reportBtnTitle: "ख़तरा / समस्या दर्ज करें",
    reportBtnSub: "माइक दबाकर बोलें या फ़ोटो खींचें",
    statTotal: "कुल रिपोर्ट्स",
    statPending: "प्रगति पर",
    statResolved: "ठीक और सुरक्षित",
    recentReports: "हालिया रिपोर्ट्स",
    seeAll: "सभी देखें →",
    noReportsYet: "अभी तक कोई रिपोर्ट नहीं है",
    noReportsSub: "जब आप कोई समस्या दर्ज करेंगे, वह यहाँ दिखाई देगी।",

    submitTitle: "ख़तरा दर्ज करें",
    submitSubtitle: "माइक दबाकर बोलें। AI अपने आप ख़तरे की गंभीरता समझकर सुरक्षा टीम को भेजेगा।",
    locationLabel: "1. ख़तरा कहाँ है? (स्थान चुनें) *",
    selectLocation: "-- स्थान चुनें --",

    voiceMainTitle: "2. माइक दबाकर बोलें (मुख्य विकल्प)",
    voiceMainSubtitle: "माइक बटन दबाकर रखें और बोलें। आपकी आवाज़ अपने आप नीचे लिख दी जाएगी।",
    voiceHoldToSpeak: "माइक दबाकर रखें और बोलें",
    voiceTapToSpeak: "दबाकर रखें या टैप करके बोलें",
    voiceListeningNow: "🔴 सुन रहा हूँ... अभी बोलिए",
    voiceRecordingTimer: "रिकॉर्डिंग",
    voiceRecordedSuccess: "आपकी आवाज़ रिकॉर्ड हो गई",
    voiceReRecord: "🔄 दोबारा बोलें",
    voiceDelete: "✕ रिकॉर्डिंग हटाएं",
    voiceAutoTranscribed: "आपकी आवाज़ से लिखा गया विवरण:",

    optionalTextLabel: "3. लिखकर विवरण दें (ऐच्छिक - जरूरी नहीं)",
    optionalTextPlaceholder: "जो आप बोलेंगे वह यहाँ अपने आप लिख जाएगा। चाहें तो खुद भी लिख सकते हैं...",
    optionalTextHint: "अगर आपने आवाज़ रिकॉर्ड कर दी है या फ़ोटो लगा दी है, तो इसे खाली छोड़ सकते हैं।",

    photoLabel: "4. फ़ोटो जोड़ें (ऐच्छिक)",
    photoHint: "AI फ़ोटो देखकर ख़तरा अपने आप पहचान लेगा",
    photoBtn: "📷 फ़ोटो खींचें या चुनें",
    removePhoto: "✕ फ़ोटो हटाएं",

    submitBtn: "रिपोर्ट तुरंत भेजें",
    submitting: "AI जांच हेतु भेजा जा रहा है...",
    submitSuccessTitle: "रिपोर्ट सफलतापूर्वक दर्ज हो गई!",
    submitSuccessMsg: "आपकी आवाज़ और फ़ोटो प्राप्त हो गई है। AI ख़तरे की जांच करके तुरंत सुधार टीम को भेज रहा है।",
    viewMyReports: "मेरी रिपोर्ट्स देखें",
    submitAnother: "एक और ख़तरा दर्ज करें",

    errLocation: "कृपया स्थान चुनें कि ख़तरा कहाँ है।",
    errNoInput: "कृपया माइक दबाकर बोलें, विवरण लिखें, या फ़ोटो लगाएं।",
    errPhotoSize: "फ़ोटो का आकार बहुत बड़ा है। कृपया छोटी फ़ोटो चुनें।",
    errMicPermission: "आवाज़ रिकॉर्ड करने के लिए माइक की अनुमति (Permission) दें।",

    dangerLevelTitle: "ख़तरे का स्तर (AI द्वारा आंका गया)",
    suggestionsTitle: "सुरक्षा निर्देश एवं सुझाव (What to do)",
    reportedDetailsTitle: "दर्ज की गई समस्या",
    actionTakenTitle: "सुधार व कार्रवाई की स्थिति",
    assignedTo: "किसे सौंपा गया",
    dueDate: "सुधार की अंतिम तिथि",
    listenAdviceBtn: "🔊 बोलकर सुनाएं (आवाज़ में सुनें)",
    stopListenAdviceBtn: "⏹️ आवाज़ रोकें",

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
      "वेयरहाउस / मुख्य गलियारा (Warehouse)",
      "अन्य स्थान (Other Location)",
    ],
  },
};
