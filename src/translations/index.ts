export type Language = 'en' | 'ta';

export const TRANSLATIONS = {
  en: {
    brand: 'GUARDIA',
    tagline: 'One Mission. Zero Delay. Countless Lives.',
    nav: {
      overview: 'Command Overview',
      map: 'National Map',
      lifeFirst: 'LIFE-FIRST Queue',
      incidents: 'Incidents Registry',
      rescueBridge: 'RESCUE BRIDGE',
      crisisPulse: 'Crisis Pulse',
      resources: 'Fleet Resources',
      teams: 'Response Teams',
      sos: 'SOS NOW',
      familyLink: 'Family Link',
      finder: 'Finder (Missing)',
      realityCheck: 'Reality Check',
      analytics: 'Human Impact Radar',
      reportEmergency: 'Report Emergency',
      trackReport: 'Track Report',
      login: 'Sign In',
      logout: 'Sign Out'
    },
    hero: {
      headline: 'ONE MISSION. ZERO DELAY. COUNTLESS LIVES.',
      subhead: 'An intelligent emergency response ecosystem connecting citizens, administrators, and emergency services through real-time incident intelligence across India.',
      reportBtn: 'REPORT AN EMERGENCY',
      exploreBtn: 'EXPLORE LIVE MAP',
      trackBtn: 'TRACK BY INCIDENT ID',
      statsActive: 'Active Incidents',
      statsP1: 'Critical P1 Priority',
      statsUnits: 'Dispatched Units',
      statsAck: 'Acknowledgement Rate'
    },
    categories: {
      fire: 'Fire Emergency',
      road_accident: 'Road Accident',
      medical: 'Medical Emergency',
      flood: 'Flood / Inundation',
      building_collapse: 'Building Collapse',
      other: 'Other Emergency'
    },
    priorities: {
      P1: 'P1 - Life-Threatening',
      P2: 'P2 - Urgent',
      P3: 'P3 - Moderate',
      P4: 'P4 - Lower Urgency'
    },
    status: {
      reported: 'Reported',
      pending: 'Pending Review',
      verified: 'Verified',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed'
    },
    verification: {
      unverified: 'Pending Verification',
      verified: 'Verified Authentic',
      rejected: 'Marked Invalid'
    },
    departments: {
      police: 'Police Command',
      fire: 'Fire & Rescue Services',
      ambulance: 'Emergency Medical Services (108)'
    },
    reportingForm: {
      modalTitle: 'Submit National Emergency Report',
      modalSubtitle: 'Provide essential situational details. Real-time LIFE-FIRST triage prioritises threats to human life immediately.',
      offlineBanner: 'OFFLINE MODE ACTIVE: Report will be saved safely to local storage and can be transmitted once connectivity resumes.',
      titleLabel: 'Incident Title / Brief Summary',
      titlePlaceholder: 'e.g., Major chemical warehouse fire with trapped workers',
      categoryLabel: 'Emergency Category',
      locationHeader: 'Geographical Coordinates & Locality',
      stateLabel: 'State / Union Territory',
      districtLabel: 'District',
      localityLabel: 'Locality / Street / Landmark',
      localityPlaceholder: 'e.g., Poonamallee High Road near Kilpauk hospital',
      useGpsBtn: 'Detect My Location (GPS)',
      gpsSuccess: 'Location detected successfully',
      gpsError: 'Could not access GPS. Please select on map or enter manually.',
      humanImpactHeader: 'Human Life & Injury Assessment',
      affectedLabel: 'Estimated People Affected',
      injuredLabel: 'Reported Injured Count',
      injurySeverityLabel: 'Injury Severity Level',
      injuriesNone: 'No Reported Injuries',
      injuriesMinor: 'Minor / Superficial Injuries',
      injuriesSerious: 'Serious Injuries (Fractures, Deep Lacerations)',
      injuriesLifeThreat: 'Life-Threatening Trauma / Breathing Failure / Unconscious',
      injuriesUnknown: 'Unknown / Unconfirmed (Safety Baseline Applied)',
      trappedLabel: 'Are people trapped under debris, water, or structures?',
      dangerLabel: 'Is there immediate, acute danger to human life?',
      escalatingLabel: 'Is the hazard actively expanding or escalating?',
      vulnerableLabel: 'Are infants, elderly, or disabled individuals trapped/affected?',
      symptomsLabel: 'Medical Symptoms / Hazard Observations (Optional)',
      symptomsPlaceholder: 'e.g., Unconscious victims, smoke choking, electrical sparking',
      contactHeader: 'Reporter Verification (Optional)',
      nameLabel: 'Your Name',
      phoneLabel: 'Phone Number',
      anonLabel: 'Submit as Anonymous Citizen',
      photoLabel: 'Upload Photo / Evidence (Optional)',
      cancelBtn: 'Cancel',
      submitBtn: 'Submit Emergency Report',
      submittingBtn: 'Evaluating LIFE-FIRST Priority...'
    },
    confirmation: {
      successTitle: 'Emergency Report Transmitted Successfully',
      successMessage: 'Your report has been received into the GUARDIA centralized intelligence engine. A unique tracking reference has been generated for real-time monitoring.',
      refLabel: 'Incident Tracking Reference',
      priorityLabel: 'LIFE-FIRST Assessed Priority',
      trackNowBtn: 'Track Incident Status Now',
      doneBtn: 'Return to Command Overview'
    },
    tracker: {
      title: 'Citizen Emergency Tracking Portal',
      placeholder: 'Enter Incident Reference (e.g., GUA-TN-2026-8821)',
      trackBtn: 'Track Status',
      pipelineHeader: 'Response Progression Pipeline',
      dispatchHeader: 'Emergency Services Coordination',
      noIncident: 'Please enter a valid reference ID to view real-time intelligence.'
    },
    demo: {
      bannerText: 'GUARDIA DEMO ENVIRONMENT: Fictional incident telemetry active. Simulated emergency responses are clearly distinguished from actual public safety communication.',
      resetBtn: 'Reset Demo Data',
      resetConfirm: 'Are you sure you want to restore the demonstration database to default state?',
      personaAdmin: 'Admin Persona',
      personaPolice: 'Police Persona',
      personaFire: 'Fire & Rescue',
      personaAmbulance: 'EMS 108',
      personaCitizen: 'Citizen Persona'
    }
  },
  ta: {
    brand: 'கார்டியா (GUARDIA)',
    tagline: 'ஒரே இலக்கு. துளியும் தாமதமில்லை. எண்ணற்ற உயிர்கள்.',
    nav: {
      overview: 'கட்டளை மையம்',
      map: 'தேசிய வரைபடம்',
      lifeFirst: 'உயிர்-முதன்மை வரிசை',
      incidents: 'அவசரப் பதிவேடு',
      rescueBridge: 'மீட்புப் பாலம்',
      crisisPulse: 'நெருக்கடி நாடி (Crisis Pulse)',
      resources: 'அவசர வாகனங்கள்',
      teams: 'மீட்புக் குழுக்கள்',
      sos: 'அவசர SOS',
      familyLink: 'குடும்ப இணைப்பு',
      finder: 'காணாமல் போனவர்கள்',
      realityCheck: 'பட உண்மை சரிபார்ப்பு',
      analytics: 'மனித தாக்க பகுப்பாய்வு',
      reportEmergency: 'அவசர தகவல் தெரிவி',
      trackReport: 'நிலவரம் அறிதல்',
      login: 'உள்நுழை',
      logout: 'வெளியேறு'
    },
    hero: {
      headline: 'ஒரே இலக்கு. துளியும் தாமதமில்லை. எண்ணற்ற உயிர்கள்.',
      subhead: 'குடிமக்கள், அரசு நிர்வாகம் மற்றும் அவசர சேவைப் படைகளை உடனடியாக இணைக்கும் இந்தியாவின் அதிநவீன தேசிய அவசர மேலாண்மை தளம்.',
      reportBtn: 'அவசர நிலையைத் தெரிவிக்கவும்',
      exploreBtn: 'நேரலை வரைபடத்தை காண்க',
      trackBtn: 'குறிப்பு எண்ணால் அறியவும்',
      statsActive: 'செயலில் உள்ள சம்பவங்கள்',
      statsP1: 'உயிர்-ஆபத்து முன்னுரிமை',
      statsUnits: 'பணியில் உள்ள பிரிவுகள்',
      statsAck: 'ஏற்பு விகிதம்'
    },
    categories: {
      fire: 'தீ விபத்து',
      road_accident: 'சாலை விபத்து',
      medical: 'மருத்துவ அவசரம்',
      flood: 'வெள்ளம் / பெருவெள்ளம்',
      building_collapse: 'கட்டட இடிவு',
      other: 'பிற அவசர நிலை'
    },
    priorities: {
      P1: 'P1 - உயிருக்கு உடனடி ஆபத்து',
      P2: 'P2 - அவசர உதவி தேவை',
      P3: 'P3 - நடுத்தர முன்னுரிமை',
      P4: 'P4 - குறைந்த அவசரம்'
    },
    status: {
      reported: 'பதிவு செய்யப்பட்டது',
      pending: 'ஆய்வில் உள்ளது',
      verified: 'உறுதி செய்யப்பட்டது',
      in_progress: 'மீட்புப் பணியில் உள்ளது',
      resolved: 'தீர்க்கப்பட்டது',
      closed: 'நிறைவுற்றது'
    },
    verification: {
      unverified: 'சரிபார்க்கப்படாதது',
      verified: 'உறுதிப்படுத்தப்பட்டது',
      rejected: 'நிராகரிக்கப்பட்டது'
    },
    departments: {
      police: 'காவல்துறை கட்டுப்பாட்டு மையம்',
      fire: 'தீயணைப்பு மற்றும் மீட்புப் படை',
      ambulance: '108 அவசர மருத்துவ சேவை'
    },
    reportingForm: {
      modalTitle: 'அவசர நிலையைப் பதிவு செய்க',
      modalSubtitle: 'நிகழ்விடத்தின் துல்லியமான தகவலை வழங்கவும். மனித உயிரைக் காக்கும் LIFE-FIRST தொழில்நுட்பம் உடனடியாக உதவிகளை ஒருங்கிணைக்கும்.',
      offlineBanner: 'இணையம் இல்லை: தகவல் உள்ளூர் சாதனத்தில் சேமிக்கப்படும்; இணைப்பு வந்ததும் அனுப்பலாம்.',
      titleLabel: 'சம்பவ தலைப்பு / சுருக்கம்',
      titlePlaceholder: 'எ.கா., கிடங்கில் தீவிர தீ விபத்து, பணியாளர்கள் சிக்கியுள்ளனர்',
      categoryLabel: 'அவசரப் பிரிவு',
      locationHeader: 'புவியியல் இருப்பிடம் & பகுதி',
      stateLabel: 'மாநிலம் / யூனியன் பிரதேசம்',
      districtLabel: 'மாவட்டம்',
      localityLabel: 'பகுதி / தெரு / அடையாள சின்னம்',
      localityPlaceholder: 'எ.கா., பூந்தமல்லி நெடுஞ்சாலை, கீழ்ப்பாக்கம் அருகில்',
      useGpsBtn: 'என் இருப்பிடத்தை கண்டறி (GPS)',
      gpsSuccess: 'இருப்பிடம் வெற்றிகரமாக கண்டறியப்பட்டது',
      gpsError: 'GPS அணுகல் பெற முடியவில்லை. வரைபடத்தில் தேர்ந்தெடுக்கவும்.',
      humanImpactHeader: 'மனித உயிரிழப்பு & காயங்கள் மதிப்பீடு',
      affectedLabel: 'பாதிக்கப்பட்டோர் எண்ணிக்கை (தோராயமாக)',
      injuredLabel: 'காயமடைந்தோர் எண்ணிக்கை',
      injurySeverityLabel: 'காயங்களின் தீவிரம்',
      injuriesNone: 'காயங்கள் எதுவும் இல்லை',
      injuriesMinor: 'லேசான காயங்கள்',
      injuriesSerious: 'கடுமையான காயங்கள் (எலும்பு முறிவு, ஆழமான வெட்டுகள்)',
      injuriesLifeThreat: 'உயிருக்கு ஆபத்து / மூச்சுத்திணறல் / நினைவிழந்த நிலை',
      injuriesUnknown: 'தெரியவில்லை (பாதுகாப்பு முன்னெச்சரிக்கை முறை)',
      trappedLabel: 'இடிபாடுகள் அல்லது நீரில் மனிதர்கள் சிக்கியுள்ளனரா?',
      dangerLabel: 'உயிருக்கு உடனடி ஆபத்து உள்ளதா?',
      escalatingLabel: 'ஆபத்து மேலும் பரவி வருகிறதா?',
      vulnerableLabel: 'குழந்தைகள், முதியவர்கள், மாற்றுத்திறனாளிகள் உள்ளார்களா?',
      symptomsLabel: 'மருத்துவ அறிகுறிகள் / பிற விவரங்கள் (விரும்பினால்)',
      symptomsPlaceholder: 'எ.கா., மூச்சுத்திணறல், கடுமையான புகை, மின்கசிவு',
      contactHeader: 'தகவல் அளிப்பவர் விவரம் (விரும்பினால்)',
      nameLabel: 'உங்கள் பெயர்',
      phoneLabel: 'தொலைபேசி எண்',
      anonLabel: 'பெயரின்றி ரகசியமாக சமர்ப்பிக்கவும்',
      photoLabel: 'புகைப்படம் பதிவேற்றுக (விரும்பினால்)',
      cancelBtn: 'ரத்து செய்',
      submitBtn: 'அவசர அறிக்கையை சமர்ப்பிக்கவும்',
      submittingBtn: 'முன்னுரிமை கணக்கிடப்படுகிறது...'
    },
    confirmation: {
      successTitle: 'அவசர தகவல் வெற்றிகரமாக பதிவு செய்யப்பட்டது',
      successMessage: 'உங்கள் தகவல் கார்டியா (GUARDIA) தேசிய மையத்திற்கு அனுப்பப்பட்டுள்ளது. நேரலை நிலவரத்தை அறிய தனித்துவ குறிப்பு எண் உருவாக்கப்பட்டுள்ளது.',
      refLabel: 'அவசர குறிப்பு எண் (Reference ID)',
      priorityLabel: 'LIFE-FIRST கணக்கிட்ட முன்னுரிமை',
      trackNowBtn: 'நிலவரத்தை இப்போது காண்க',
      doneBtn: 'கட்டளை மையத்திற்குச் செல்'
    },
    tracker: {
      title: 'குடிமக்கள் அவசர நிலவரம் அறியும் மையம்',
      placeholder: 'குறிப்பு எண்ணை உள்ளிடவும் (எ.கா., GUA-TN-2026-8821)',
      trackBtn: 'நிலவரம் தேடு',
      pipelineHeader: 'மீட்புப் பணி முன்னேற்றப் பாதை',
      dispatchHeader: 'அவசரப் படைகளின் ஒருங்கிணைப்பு',
      noIncident: 'நேரலை நிலவரத்தைக் காண சரியான குறிப்பு எண்ணை உள்ளிடவும்.'
    },
    demo: {
      bannerText: 'கார்டியா மாதிரி சூழல்: காட்டப்படும் தகவல்கள் விளக்க நோக்கத்திற்கானது. உண்மையான அவசரப் படைகள் அழைக்கப்படவில்லை.',
      resetBtn: 'மாதிரி தகவலை மீட்டமைக்க',
      resetConfirm: 'மாதிரி தரவுத்தளத்தை இயல்புநிலைக்கு மாற்ற விரும்புகிறீர்களா?',
      personaAdmin: 'நிர்வாகி (Admin)',
      personaPolice: 'காவல்துறை',
      personaFire: 'தீயணைப்புப் படை',
      personaAmbulance: 'ஆம்புலன்ஸ் (108)',
      personaCitizen: 'குடிமகன்'
    }
  }
};
