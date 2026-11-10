import fs from 'fs';
import path from 'path';
import { 
  Incident, 
  User, 
  EmergencyResource, 
  CrisisCluster, 
  DuplicateSuggestion, 
  PlatformNotification, 
  IncidentAuditEntry,
  DepartmentNotification,
  ResponseTeam,
  ResponseCategory,
  TeamAvailabilityStatus,
  SOSAlert,
  SOSStatus,
  FamilyGroup,
  FamilyMember,
  FamilySafetyStatus,
  ReunificationCentre,
  MissingPersonCase,
  MissingPersonSighting,
  MissingPersonStatus,
  ImageAuthenticityResult
} from '../src/types/index.ts';
import { calculateLifeFirstAssessment } from './lifeFirstEngine.ts';
import { createDepartmentNotifications } from './rescueBridge.ts';
import { detectCrisisClusters } from './crisisPulse.ts';
import { detectDuplicates } from './duplicateDetection.ts';
import { recommendBestResponseTeam, generateRouteCoordinates } from './teamAssignmentEngine.ts';
import { analyzeImageAuthenticity } from './realityCheckEngine.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'guardia_db.json');

export interface DatabaseSchema {
  users: User[];
  incidents: Incident[];
  resources: EmergencyResource[];
  teams: ResponseTeam[];
  sosAlerts: SOSAlert[];
  familyGroups: FamilyGroup[];
  reunificationCentres: ReunificationCentre[];
  missingPersons: MissingPersonCase[];
  missingSightings: MissingPersonSighting[];
  imageVerifications: ImageAuthenticityResult[];
  clusters: CrisisCluster[];
  duplicates: DuplicateSuggestion[];
  notifications: PlatformNotification[];
  auditLogs: IncidentAuditEntry[];
}

function getInitialDemoData(): DatabaseSchema {
  const now = Date.now();
  const subTime = (minutesAgo: number) => new Date(now - minutesAgo * 60 * 1000).toISOString();

  const users: User[] = [
    {
      id: 'USR-ADMIN-1',
      name: 'Aditya Vardhan',
      email: 'admin@guardia.gov.in',
      role: 'admin',
      badgeNumber: 'GUA-DIR-001'
    },
    {
      id: 'USR-POLICE-1',
      name: 'Inspector R. Selvakumar',
      email: 'police@guardia.gov.in',
      role: 'department',
      department: 'police',
      badgeNumber: 'TN-POL-4412'
    },
    {
      id: 'USR-FIRE-1',
      name: 'Chief Officer M. Banerjee',
      email: 'fire@guardia.gov.in',
      role: 'department',
      department: 'fire',
      badgeNumber: 'FRS-HQ-902'
    },
    {
      id: 'USR-AMB-1',
      name: 'Dr. Priya Nambiar (EMS 108)',
      email: 'medical@guardia.gov.in',
      role: 'department',
      department: 'ambulance',
      badgeNumber: 'EMS-DOC-108'
    },
    {
      id: 'USR-CITIZEN-1',
      name: 'Kavitha Ramesh',
      email: 'citizen@example.com',
      role: 'citizen'
    }
  ];

  // ----------------------------------------------------
  // EMERGENCY RESPONSE TEAMS (DEMO SEED)
  // ----------------------------------------------------
  const teams: ResponseTeam[] = [
    {
      id: 'TEAM-FIRE-01',
      name: 'Station 4 Rapid Extrication Alpha',
      category: 'fire_rescue',
      department: 'Tamil Nadu Fire & Rescue Services',
      leader: 'Station Officer S. Murugan',
      memberCount: 8,
      location: 'Kilpauk Fire Depot, Poonamallee High Rd, Chennai',
      latitude: 13.0805,
      longitude: 80.2450,
      status: 'assigned',
      assignedIncidentId: 'INC-DEMO-01',
      equipment: ['Heavy Hydraulic Cutters', 'High-Pressure Water Tender', 'Thermal Imager', 'Breathing Apparatus (SCBA)'],
      capabilities: ['Structural Firefighting', 'Heavy Extrication', 'Toxic Smoke Mitigation'],
      speedKmh: 55,
      lastLocationUpdate: subTime(4),
      assignmentHistoryCount: 14,
      isSimulated: true
    },
    {
      id: 'TEAM-EMS-01',
      name: 'EMS 108 Critical Care Trauma Unit #12',
      category: 'medical_ambulance',
      department: 'Emergency Medical Services (108)',
      leader: 'Dr. Priya Nambiar',
      memberCount: 4,
      location: 'Central General Hospital Base, Chennai',
      latitude: 13.0820,
      longitude: 80.2740,
      status: 'on_scene',
      assignedIncidentId: 'INC-DEMO-01',
      equipment: ['Advanced Life Support (ALS)', 'Defibrillator', 'Mobile Ventilator', 'Trauma Stabilization Kits'],
      capabilities: ['Cardiac Life Support', 'Trauma Triage', 'On-Scene Resuscitation'],
      speedKmh: 60,
      lastLocationUpdate: subTime(2),
      assignmentHistoryCount: 22,
      isSimulated: true
    },
    {
      id: 'TEAM-POL-01',
      name: 'PCR Flying Squad Sector Alpha-7',
      category: 'police',
      department: 'Greater Chennai Police Command',
      leader: 'Sub-Inspector Ananth K.',
      memberCount: 4,
      location: 'Chetpet Roundabout, Chennai',
      latitude: 13.0710,
      longitude: 80.2410,
      status: 'en_route',
      assignedIncidentId: 'INC-DEMO-01',
      equipment: ['Emergency Perimeter Barricades', 'Megaphone PA System', 'First Aid Trauma Kit'],
      capabilities: ['Green Corridor Clearing', 'Perimeter Evacuation', 'Traffic Diversion'],
      speedKmh: 65,
      lastLocationUpdate: subTime(3),
      assignmentHistoryCount: 31,
      isSimulated: true
    },
    {
      id: 'TEAM-NDRF-04',
      name: 'NDRF 04 Battalion Urban Search & Rescue Team',
      category: 'search_and_rescue',
      department: 'National Disaster Response Force',
      leader: 'Commandant R. K. Verma',
      memberCount: 18,
      location: 'Arakkonam / Tambaram Forward Base',
      latitude: 12.9249,
      longitude: 80.1000,
      status: 'available',
      equipment: ['Concrete Breakers', 'Acoustic Life Detectors', 'Inflatable Rescue Boats', 'Canine Search Unit'],
      capabilities: ['Deep Rubble Extrication', 'Flood Swift Water Rescue', 'Confined Space Life Search'],
      speedKmh: 70,
      lastLocationUpdate: subTime(15),
      assignmentHistoryCount: 8,
      isSimulated: true
    },
    {
      id: 'TEAM-FIRE-02',
      name: 'Mumbai Fire Brigade Industrial Foam Tender Unit 9',
      category: 'fire_rescue',
      department: 'Mumbai Fire Brigade',
      leader: 'Divisional Fire Officer Patil',
      memberCount: 10,
      location: 'Andheri West Fire Station, Mumbai',
      latitude: 19.1136,
      longitude: 72.8697,
      status: 'available',
      equipment: ['Chemical Foam Tender', 'Hydraulic Aerial Platform 55m', 'Hazmat Suits'],
      capabilities: ['Hydrocarbon Fire Suppression', 'High-Rise Rescue'],
      speedKmh: 50,
      lastLocationUpdate: subTime(12),
      assignmentHistoryCount: 19,
      isSimulated: true
    },
    {
      id: 'TEAM-EMS-02',
      name: 'Bengaluru 108 ALS Rapid Responder #04',
      category: 'medical_ambulance',
      department: 'Karnataka Health System / EMS 108',
      leader: 'Paramedic Lead Chetan Gowda',
      memberCount: 3,
      location: 'Koramangala Ring Road Base, Bengaluru',
      latitude: 12.9352,
      longitude: 77.6245,
      status: 'available',
      equipment: ['ALS Monitor', 'Portable Oxygen', 'Spinal Immobilization Board'],
      capabilities: ['Emergency Resuscitation', 'Rapid Patient Transport'],
      speedKmh: 55,
      lastLocationUpdate: subTime(8),
      assignmentHistoryCount: 27,
      isSimulated: true
    }
  ];

  // ----------------------------------------------------
  // REUNIFICATION CENTRES & EMERGENCY SHELTERS
  // ----------------------------------------------------
  const reunificationCentres: ReunificationCentre[] = [
    {
      id: 'RC-TN-01',
      name: 'Kilpauk Medical College Emergency Relief Centre',
      type: 'reunification_centre',
      address: 'Poonamallee High Road, Kilpauk, Chennai, Tamil Nadu',
      state: 'Tamil Nadu',
      district: 'Chennai',
      latitude: 13.0815,
      longitude: 80.2460,
      capacity: 350,
      availableCapacity: 184,
      facilities: ['Trauma Ward', 'Family Reception Desk', 'Emergency Food & Water', 'Satellite Phone Connectivity'],
      contact: '+91 44 2836 XXXXX',
      operationalStatus: 'open'
    },
    {
      id: 'RC-TN-02',
      name: 'Jawaharlal Nehru Indoor Relief Shelter',
      type: 'emergency_shelter',
      address: 'Sydenhams Road, Periamet, Chennai, Tamil Nadu',
      state: 'Tamil Nadu',
      district: 'Chennai',
      latitude: 13.0850,
      longitude: 80.2720,
      capacity: 800,
      availableCapacity: 520,
      facilities: ['Temporary Bedding', 'Medical First Aid Post', 'Power Generator', 'Child Welfare Desk'],
      contact: '+91 44 2538 XXXXX',
      operationalStatus: 'open'
    },
    {
      id: 'RC-MH-01',
      name: 'Bandra Reclamation Disaster Relief Station',
      type: 'relief_camp',
      address: 'KC Marg, Bandra West, Mumbai, Maharashtra',
      state: 'Maharashtra',
      district: 'Mumbai',
      latitude: 19.0544,
      longitude: 72.8402,
      capacity: 500,
      availableCapacity: 290,
      facilities: ['Canteen Services', 'Doctor On Duty', 'Missing Persons Bulletin Board'],
      contact: '+91 22 2640 XXXXX',
      operationalStatus: 'open'
    }
  ];

  // ----------------------------------------------------
  // FAMILY LINK — REUNIFICATION GROUPS
  // ----------------------------------------------------
  const familyGroups: FamilyGroup[] = [
    {
      id: 'FAM-TN-7812',
      name: 'Ramesh & Kavitha Family Group',
      adminId: 'USR-CITIZEN-1',
      adminName: 'Kavitha Ramesh',
      invitationCode: 'GUARDIA-FAM-9941',
      preferredMeetingPoint: 'Kilpauk Metro Station Concourse Gate 2',
      reunificationCentreId: 'RC-TN-01',
      createdAt: subTime(320),
      emergencyContacts: [
        { name: 'Kavitha Ramesh', phone: '+91 98401 23456' },
        { name: 'Dr. Suresh Kumar (Uncle)', phone: '+91 98402 88712' }
      ],
      members: [
        {
          id: 'MEM-01',
          name: 'Kavitha Ramesh',
          relationship: 'Self / Group Admin',
          phone: '+91 98401 23456',
          safetyStatus: 'safe',
          lastSharedLocation: 'Kilpauk High Road near Medical College',
          latitude: 13.0818,
          longitude: 80.2458,
          locationTimestamp: subTime(15),
          locationSharingPermission: true,
          checkInNotes: 'Safe at relief desk. Waiting for Ramesh.'
        },
        {
          id: 'MEM-02',
          name: 'Ramesh Sundaram (Spouse)',
          relationship: 'Spouse',
          phone: '+91 98401 77651',
          safetyStatus: 'evacuating',
          lastSharedLocation: 'Exiting warehouse zone via Taylor Road',
          latitude: 13.0835,
          longitude: 80.2500,
          locationTimestamp: subTime(25),
          locationSharingPermission: true,
          checkInNotes: 'Fire department assisting evacuation. Breathing okay.'
        },
        {
          id: 'MEM-03',
          name: 'Meenakshi Sundaram (Mother)',
          relationship: 'Mother',
          phone: '+91 98409 33211',
          safetyStatus: 'at_reunification_centre',
          lastSharedLocation: 'Kilpauk Medical College Emergency Relief Centre',
          latitude: 13.0815,
          longitude: 80.2460,
          locationTimestamp: subTime(40),
          locationSharingPermission: true,
          checkInNotes: 'Comfortable at women shelter wing.'
        }
      ]
    }
  ];

  // ----------------------------------------------------
  // FINDER — MISSING PERSON CASES & SIGHTINGS
  // ----------------------------------------------------
  const missingPersons: MissingPersonCase[] = [
    {
      id: 'MP-2026-4412',
      fullName: 'Aarav Mohan',
      age: 9,
      gender: 'Male',
      photoUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=400&q=80',
      dateTimeLastSeen: subTime(110),
      lastKnownLocation: 'Outside Kilpauk Shopping Complex during warehouse fire panic',
      lastKnownLatitude: 13.0827,
      lastKnownLongitude: 80.2707,
      clothingDescription: 'Navy blue sports t-shirt, beige shorts, blue canvas shoes',
      physicalDescription: 'Height ~130cm, short dark hair, small birthmark on left forearm',
      identifyingCharacteristics: 'Carrying a small red water bottle with cartoon sticker',
      medicalOrAccessibilityNeeds: 'Mild asthma, needs inhaler if exposed to heavy smoke',
      circumstances: 'Separated from mother when crowd rushed away from warehouse smoke cloud.',
      reportingPersonName: 'Sunita Mohan (Mother)',
      reportingPersonContact: '+91 98405 11922',
      policeReportReference: 'TN-FIR-2026/8941',
      status: 'search_active',
      sightingsCount: 2,
      assignedSearchTeamId: 'TEAM-POL-01',
      assignedSearchTeamName: 'PCR Flying Squad Sector Alpha-7',
      reportedAt: subTime(95),
      updatedAt: subTime(15)
    },
    {
      id: 'MP-2026-9021',
      fullName: 'K. Shankaran',
      age: 72,
      gender: 'Male',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      dateTimeLastSeen: subTime(180),
      lastKnownLocation: 'Bellandur Lake Enclave during flash flood inundation',
      lastKnownLatitude: 12.9352,
      lastKnownLongitude: 77.6245,
      clothingDescription: 'White cotton dhoti and grey striped shirt, black reading spectacles',
      physicalDescription: 'Height 165cm, grey hair, walking with wooden cane',
      identifyingCharacteristics: 'Hearing aid in right ear',
      medicalOrAccessibilityNeeds: 'Hypertension medicine required daily',
      circumstances: 'Evacuated by boat from ground floor, separated at transport staging area.',
      reportingPersonName: 'Vikram Shankaran (Son)',
      reportingPersonContact: '+91 99001 88241',
      status: 'under_verification',
      sightingsCount: 1,
      reportedAt: subTime(140),
      updatedAt: subTime(60)
    }
  ];

  const missingSightings: MissingPersonSighting[] = [
    {
      id: 'SIGHT-01',
      caseId: 'MP-2026-4412',
      sightingLocation: 'Near Kilpauk Metro Station Concourse Gate 1',
      latitude: 13.0818,
      longitude: 80.2455,
      sightingTime: subTime(35),
      description: 'Boy matching navy t-shirt description sitting with volunteer near water stall.',
      reporterName: 'M. Divya (Volunteer)',
      reporterContact: '+91 98411 XXXXX',
      status: 'verified_sighting',
      confidenceScore: 88,
      submittedAt: subTime(30),
      verifiedBy: 'Inspector R. Selvakumar',
      reviewNotes: 'Volunteer confirmed child name is Aarav. Search team PCR Alpha-7 dispatched to escort.'
    }
  ];

  // ----------------------------------------------------
  // SOS NOW ALERTS (DEMO SEED)
  // ----------------------------------------------------
  const sosAlerts: SOSAlert[] = [
    {
      id: 'SOS-2026-8912',
      citizenId: 'USR-CITIZEN-1',
      citizenName: 'Kavitha Ramesh',
      citizenPhone: '+91 98401 23456',
      emergencyCategory: 'fire',
      latitude: 13.0825,
      longitude: 80.2700,
      locality: 'Poonamallee High Road, Kilpauk, Chennai',
      locationAccuracyMeters: 6,
      timestamp: subTime(28),
      emergencyContacts: [
        { name: 'Ramesh Sundaram', phone: '+91 98401 77651' },
        { name: 'Dr. Suresh Kumar', phone: '+91 98402 88712' }
      ],
      status: 'team_assigned',
      assignedTeamId: 'TEAM-EMS-01',
      assignedTeamName: 'EMS 108 Critical Care Trauma Unit #12',
      assignedIncidentId: 'INC-DEMO-01',
      notes: 'Citizen activated SOS after heavy smoke entered commercial building stairway.',
      lastLocationUpdate: subTime(5),
      notificationsSent: [
        { contactName: 'Ramesh Sundaram', phone: '+91 98401 77651', channel: 'sms', status: 'simulated', sentAt: subTime(28) },
        { contactName: 'Dr. Suresh Kumar', phone: '+91 98402 88712', channel: 'sms', status: 'simulated', sentAt: subTime(28) }
      ],
      isDemo: true
    }
  ];

  // ----------------------------------------------------
  // REALITY CHECK — IMAGE AUTHENTICITY RECORDS
  // ----------------------------------------------------
  const imageVerifications: ImageAuthenticityResult[] = [
    {
      id: 'AUTH-DEMO-01',
      status: 'verified_real',
      confidenceScore: 94,
      fileName: 'warehouse_fire_ground_view.jpg',
      fileSizeKb: 840,
      mimeType: 'image/jpeg',
      dimensions: { width: 1920, height: 1080 },
      cryptographicHash: 'a7c92b8d4f01e687b3a4f89d9c82410a76f25e41872149b80327f123bcde9812',
      metadataStatus: 'intact',
      provenanceCredentials: 'c2pa_present',
      syntheticIndicators: [],
      manipulationIndicators: [],
      detectorVersion: 'GUARDIA-RealityCheck-v2.4',
      explanation: 'Verified camera hardware optical sensor signatures. Natural noise profile consistent with Sony IMX sensor.',
      reviewedBy: 'Aditya Vardhan (Admin)',
      reviewAction: 'approved',
      reviewNotes: 'Verified as authentic incident ground evidence.',
      verifiedAt: subTime(45)
    }
  ];

  // ----------------------------------------------------
  // INITIAL INCIDENTS
  // ----------------------------------------------------
  const rawIncidents = [
    {
      id: 'INC-DEMO-01',
      incidentReference: 'GUA-TN-2026-8821',
      title: '[SIMULATED] Multi-Story Chemical Warehouse Blaze with Trapped Staff',
      description: 'Major fire broke out in the storage section of a chemical distribution warehouse. Thick toxic smoke billowing across Poonamallee High Road. Three workers reported trapped on the 2nd floor mezzanine; immediate breathing difficulty and life danger.',
      category: 'fire' as const,
      latitude: 13.0827,
      longitude: 80.2707,
      state: 'Tamil Nadu',
      district: 'Chennai',
      locality: 'Poonamallee High Road, Kilpauk',
      peopleAffected: 28,
      peopleInjured: 4,
      injurySeverity: 'life_threatening' as const,
      peopleTrapped: true,
      immediateDanger: true,
      medicalConditionNotes: 'Severe smoke inhalation, 2nd degree thermal burns, 3 trapped individuals conscious but choking.',
      hasVulnerablePeople: false,
      isSituationEscalating: true,
      severity: 'critical' as const,
      verificationStatus: 'verified' as const,
      incidentStatus: 'in_progress' as const,
      submittedAt: subTime(48),
      updatedAt: subTime(12),
      submittedBy: { name: 'S. Ramanathan (Warehouse Supervisor)', phone: '+91 98401 XXXXX', isAnonymous: false },
      assignedTeamId: 'TEAM-FIRE-01',
      assignedTeamName: 'Station 4 Rapid Extrication Alpha',
      assignedTeamCategory: 'fire_rescue' as ResponseCategory,
      assignedDepartment: 'Tamil Nadu Fire & Rescue Services',
      distanceKm: 2.8,
      etaMinutes: 6,
      teamLocation: { latitude: 13.0805, longitude: 80.2450, label: 'En Route on Poonamallee High Rd' },
      assignmentTimestamp: subTime(42),
      isDemo: true
    },
    {
      id: 'INC-DEMO-02',
      incidentReference: 'GUA-MH-2026-4190',
      title: '[SIMULATED] Multi-Vehicle Highway Collision on Mumbai-Pune Expressway',
      description: 'Severe multi-vehicle pileup involving an intercity sleeper bus, two SUVs, and a cargo tanker near Khandala Ghat. Multiple passengers trapped in twisted vehicle frames. Fuel spill detected on carriageway.',
      category: 'road_accident' as const,
      latitude: 18.7500,
      longitude: 73.3700,
      state: 'Maharashtra',
      district: 'Pune',
      locality: 'Mumbai-Pune Expressway, Khandala Tunnel exit',
      peopleAffected: 42,
      peopleInjured: 11,
      injurySeverity: 'serious' as const,
      peopleTrapped: true,
      immediateDanger: true,
      medicalConditionNotes: 'Compound fractures, severe head trauma, two passengers pinned beneath dashboard.',
      hasVulnerablePeople: true,
      isSituationEscalating: true,
      severity: 'critical' as const,
      verificationStatus: 'verified' as const,
      incidentStatus: 'assigned' as const,
      submittedAt: subTime(75),
      updatedAt: subTime(25),
      submittedBy: { name: 'Highway Patrol Officer Deshmukh', isAnonymous: false },
      distanceKm: 5.4,
      etaMinutes: 9,
      isDemo: true
    },
    {
      id: 'INC-DEMO-03',
      incidentReference: 'GUA-DL-2026-1049',
      title: '[SIMULATED] Mass Heatstroke & Acute Dehydration at Stadium Gathering',
      description: 'Sudden collapse of spectators during high-temperature outdoor youth athletics meet in central sports complex. Medical room overwhelmed; multiple casualties unconscious with heat exhaustion.',
      category: 'medical' as const,
      latitude: 28.5912,
      longitude: 77.2285,
      state: 'Delhi',
      district: 'New Delhi',
      locality: 'Jawaharlal Nehru Stadium Complex',
      peopleAffected: 65,
      peopleInjured: 14,
      injurySeverity: 'serious' as const,
      peopleTrapped: false,
      immediateDanger: true,
      medicalConditionNotes: 'High fever, acute dehydration, delirium, unresponsiveness in 3 elderly spectators.',
      hasVulnerablePeople: true,
      isSituationEscalating: false,
      severity: 'high' as const,
      verificationStatus: 'verified' as const,
      incidentStatus: 'in_progress' as const,
      submittedAt: subTime(35),
      updatedAt: subTime(10),
      submittedBy: { name: 'Dr. Vivek Mehra (Event Medical Lead)', isAnonymous: false },
      isDemo: true
    },
    {
      id: 'INC-DEMO-04',
      incidentReference: 'GUA-KA-2026-6632',
      title: '[SIMULATED] Urban Flash Inundation & Submerged Residential Basement',
      description: 'Torrential pre-monsoon cloudburst flooded Bellandur low-lying residential layouts. Ground-floor parking completely submerged; elderly residents stranded on upper balcony with water level rising.',
      category: 'flood' as const,
      latitude: 12.9352,
      longitude: 77.6245,
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      locality: 'Bellandur Lake Enclave, Outer Ring Road',
      peopleAffected: 34,
      peopleInjured: 1,
      injurySeverity: 'minor' as const,
      peopleTrapped: true,
      immediateDanger: true,
      medicalConditionNotes: 'Hypothermia risk for elderly residents; minor cuts from floating debris.',
      hasVulnerablePeople: true,
      isSituationEscalating: true,
      severity: 'high' as const,
      verificationStatus: 'verified' as const,
      incidentStatus: 'in_progress' as const,
      submittedAt: subTime(110),
      updatedAt: subTime(40),
      submittedBy: { name: 'Ananya Rao (RWA Secretary)', isAnonymous: false },
      isDemo: true
    },
    {
      id: 'INC-DEMO-05',
      incidentReference: 'GUA-WB-2026-3021',
      title: '[SIMULATED] Structural Cantilever Collapse at Heritage Renovation Site',
      description: 'Partial structural collapse of century-old facade during retrofit works near Bowbazar. Masonry fell across pedestrian footpath. Two laborers trapped under timber and brick rubble.',
      category: 'building_collapse' as const,
      latitude: 22.5726,
      longitude: 88.3639,
      state: 'West Bengal',
      district: 'Kolkata',
      locality: 'Bowbazar / Central Avenue Corridor',
      peopleAffected: 12,
      peopleInjured: 3,
      injurySeverity: 'life_threatening' as const,
      peopleTrapped: true,
      immediateDanger: true,
      medicalConditionNotes: 'Crush injuries to extremities, suspected pelvic trauma.',
      hasVulnerablePeople: false,
      isSituationEscalating: false,
      severity: 'critical' as const,
      verificationStatus: 'verified' as const,
      incidentStatus: 'reported' as const,
      submittedAt: subTime(22),
      updatedAt: subTime(22),
      submittedBy: { name: 'B. Sen (Local Shopkeeper)', isAnonymous: false },
      isDemo: true
    },
    {
      id: 'INC-DEMO-06',
      incidentReference: 'GUA-KL-2026-7788',
      title: '[SIMULATED] Coastal Storm Surge Impacting Fishing Hamlet',
      description: 'High tidal surge breached seawall at Vypin coastline. Seven country boats capsized near harbour mouth; 12 fishermen rescued by coastal villagers; two currently undergoing basic resuscitation.',
      category: 'flood' as const,
      latitude: 9.9950,
      longitude: 76.2400,
      state: 'Kerala',
      district: 'Ernakulam',
      locality: 'Vypin Coastal Junction, Kochi',
      peopleAffected: 45,
      peopleInjured: 5,
      injurySeverity: 'serious' as const,
      peopleTrapped: false,
      immediateDanger: true,
      medicalConditionNotes: 'Near-drowning resuscitation, aspiration pneumonia risk, lacerations.',
      hasVulnerablePeople: true,
      isSituationEscalating: false,
      severity: 'high' as const,
      verificationStatus: 'verified' as const,
      incidentStatus: 'in_progress' as const,
      submittedAt: subTime(150),
      updatedAt: subTime(60),
      submittedBy: { name: 'Mathew George (Coastal Welfare Officer)', isAnonymous: false },
      isDemo: true
    },
    {
      id: 'INC-DEMO-07',
      incidentReference: 'GUA-OD-2026-9214',
      title: '[SIMULATED] Industrial Boiler Steam Leak at Power Plant Ancillary',
      description: 'High-pressure steam leak at power sub-station distribution manifold. High decibel blast heard; localized structural damage. Perimeter evacuated as safety precaution.',
      category: 'other' as const,
      latitude: 20.2961,
      longitude: 85.8245,
      state: 'Odisha',
      district: 'Khordha',
      locality: 'Mancheswar Industrial Estate, Bhubaneswar',
      peopleAffected: 15,
      peopleInjured: 0,
      injurySeverity: 'none' as const,
      peopleTrapped: false,
      immediateDanger: false,
      medicalConditionNotes: 'No burns reported; perimeter cleared.',
      hasVulnerablePeople: false,
      isSituationEscalating: false,
      severity: 'medium' as const,
      verificationStatus: 'verified' as const,
      incidentStatus: 'resolved' as const,
      submittedAt: subTime(320),
      updatedAt: subTime(180),
      submittedBy: { name: 'Plant Safety Officer Tripathy', isAnonymous: false },
      resolutionTimestamp: subTime(180),
      isDemo: true
    },
    {
      id: 'INC-DEMO-08',
      incidentReference: 'GUA-TN-2026-8829',
      title: '[SIMULATED] Warehouse on Fire with Toxic Fumes Near Poonamallee',
      description: 'Huge black smoke and flames coming from chemical warehouse near Kilpauk hospital signal. Several people shouting that workers are still inside. Traffic halted completely.',
      category: 'fire' as const,
      latitude: 13.0833,
      longitude: 80.2715,
      state: 'Tamil Nadu',
      district: 'Chennai',
      locality: 'Kilpauk Junction, Near Poonamallee High Rd',
      peopleAffected: 20,
      peopleInjured: 2,
      injurySeverity: 'unknown' as const,
      peopleTrapped: true,
      immediateDanger: true,
      medicalConditionNotes: 'People choking from fumes',
      hasVulnerablePeople: false,
      isSituationEscalating: true,
      severity: 'critical' as const,
      verificationStatus: 'unverified' as const,
      incidentStatus: 'reported' as const,
      submittedAt: subTime(38),
      updatedAt: subTime(38),
      submittedBy: { name: 'M. Karthik (Motorist)', isAnonymous: false },
      isDemo: true
    }
  ];

  const resources: EmergencyResource[] = [
    {
      id: 'RES-AMB-01',
      name: 'ALS Advanced Life Support 108 - #12',
      type: 'ambulance',
      department: 'Medical Services',
      location: 'Central Station, Chennai',
      latitude: 13.0827,
      longitude: 80.2707,
      status: 'assigned',
      assignedIncidentId: 'INC-DEMO-01',
      assignedAt: subTime(35),
      crewCount: 3,
      lastUpdated: subTime(10)
    },
    {
      id: 'RES-AMB-02',
      name: 'ALS Trauma Care Unit #04',
      type: 'ambulance',
      department: 'Medical Services',
      location: 'South Zone Depot, Bengaluru',
      latitude: 12.9716,
      longitude: 77.5946,
      status: 'available',
      crewCount: 3,
      lastUpdated: subTime(60)
    },
    {
      id: 'RES-FIRE-01',
      name: 'High-Reach Water Tender WT-4',
      type: 'fire_unit',
      department: 'Fire & Rescue',
      location: 'Anna Nagar Station, Chennai',
      latitude: 13.0850,
      longitude: 80.2100,
      status: 'assigned',
      assignedIncidentId: 'INC-DEMO-01',
      assignedAt: subTime(40),
      crewCount: 6,
      lastUpdated: subTime(15)
    },
    {
      id: 'RES-SHELTER-01',
      name: 'Kilpauk Emergency Evacuation Shelter',
      type: 'emergency_shelter',
      department: 'Disaster Management NDMA',
      location: 'Poonamallee High Rd, Kilpauk',
      latitude: 13.0815,
      longitude: 80.2460,
      status: 'available',
      crewCount: 12,
      capacity: 350,
      lastUpdated: subTime(30)
    },
    {
      id: 'RES-MED-01',
      name: 'Trauma Receiving Facility - Ward 4',
      type: 'medical_facility',
      department: 'General Hospital Command',
      location: 'Government General Hospital, Chennai',
      latitude: 13.0820,
      longitude: 80.2740,
      status: 'available',
      crewCount: 24,
      capacity: 60,
      lastUpdated: subTime(20)
    }
  ];

  const incidents: Incident[] = rawIncidents.map(raw => {
    const assessment = calculateLifeFirstAssessment({
      immediateDanger: raw.immediateDanger,
      injurySeverity: raw.injurySeverity,
      medicalConditionNotes: raw.medicalConditionNotes,
      peopleTrapped: raw.peopleTrapped,
      peopleAffected: raw.peopleAffected,
      peopleInjured: raw.peopleInjured,
      hasVulnerablePeople: raw.hasVulnerablePeople,
      isSituationEscalating: raw.isSituationEscalating,
      submittedAt: raw.submittedAt
    });

    const notifs = createDepartmentNotifications(raw as unknown as Incident, true);

    const timeline: IncidentAuditEntry[] = [
      {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: raw.submittedAt,
        actor: raw.submittedBy.name,
        actorRole: 'Citizen / Reporter',
        action: 'Incident Submitted',
        notes: 'Initial emergency report submitted via GUARDIA Citizen Reporting Portal.'
      },
      {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: raw.submittedAt,
        actor: 'GUARDIA LIFE-FIRST Engine',
        actorRole: 'Automated Prioritisation System',
        action: 'LIFE-FIRST Assessment Generated',
        notes: `Assessed Score: ${assessment.score}/100. Suggested Priority: ${assessment.suggestedPriority}. ${
          assessment.urgentReviewOverride ? `Urgent Override Triggered (${assessment.urgentReasons.join(', ')})` : ''
        }`
      }
    ];

    if (raw.verificationStatus === 'verified') {
      timeline.push({
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date(new Date(raw.submittedAt).getTime() + 4 * 60 * 1000).toISOString(),
        actor: 'Aditya Vardhan',
        actorRole: 'Administrator',
        action: 'Report Verified',
        notes: 'Incident authenticity confirmed through verified reporting signals and visual telemetry.'
      });
    }

    if (raw.assignedTeamId) {
      timeline.push({
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: raw.assignmentTimestamp || subTime(40),
        actor: 'Logistics Command',
        actorRole: 'Dispatcher',
        action: 'Team Assigned',
        notes: `Dispatched ${raw.assignedTeamName} (${raw.distanceKm} km away, ETA ${raw.etaMinutes} mins).`
      });
    }

    let routeCoordinates: [number, number][] | undefined = undefined;
    if (raw.assignedTeamId) {
      const assignedTeam = teams.find(t => t.id === raw.assignedTeamId);
      if (assignedTeam) {
        routeCoordinates = generateRouteCoordinates(
          assignedTeam.latitude, 
          assignedTeam.longitude, 
          raw.latitude, 
          raw.longitude
        );
      }
    }

    return {
      ...raw,
      suggestedPriority: assessment.suggestedPriority,
      finalPriority: assessment.suggestedPriority,
      assessment,
      notifications: notifs,
      timeline,
      routeCoordinates,
      imageAuthenticity: raw.id === 'INC-DEMO-01' ? imageVerifications[0] : undefined,
      assignedResourceIds: raw.id === 'INC-DEMO-01' ? ['RES-FIRE-01', 'RES-AMB-01'] : []
    };
  });

  const clusters = detectCrisisClusters(incidents);
  const duplicates = detectDuplicates(incidents);

  const notifications: PlatformNotification[] = [
    {
      id: 'NOTIF-01',
      type: 'critical_priority',
      title: 'P1 Life-Threatening Incident Alert',
      message: 'Multi-Story Chemical Warehouse Blaze (INC-DEMO-01) assessed P1 with trapped staff on Poonamallee High Rd.',
      incidentId: 'INC-DEMO-01',
      timestamp: subTime(45),
      read: false,
      severity: 'critical'
    },
    {
      id: 'NOTIF-02',
      type: 'sos_alert',
      title: 'Instant SOS Alert Triggered',
      message: 'Citizen Kavitha Ramesh triggered SOS alert SOS-2026-8912 near Kilpauk. Team EMS 108 assigned.',
      sosId: 'SOS-2026-8912',
      timestamp: subTime(28),
      read: false,
      severity: 'critical'
    },
    {
      id: 'NOTIF-03',
      type: 'team_assigned',
      title: 'Response Team Mobilized',
      message: 'Station 4 Rapid Extrication Alpha assigned to GUA-TN-2026-8821. ETA 6 mins.',
      incidentId: 'INC-DEMO-01',
      timestamp: subTime(40),
      read: true,
      severity: 'high'
    }
  ];

  const auditLogs: IncidentAuditEntry[] = incidents.flatMap(i => i.timeline);

  return {
    users,
    incidents,
    resources,
    teams,
    sosAlerts,
    familyGroups,
    reunificationCentres,
    missingPersons,
    missingSightings,
    imageVerifications,
    clusters,
    duplicates,
    notifications,
    auditLogs
  };
}

class GuardiaDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure new arrays exist in legacy json files
        const demo = getInitialDemoData();
        return {
          ...demo,
          ...parsed,
          teams: parsed.teams || demo.teams,
          sosAlerts: parsed.sosAlerts || demo.sosAlerts,
          familyGroups: parsed.familyGroups || demo.familyGroups,
          reunificationCentres: parsed.reunificationCentres || demo.reunificationCentres,
          missingPersons: parsed.missingPersons || demo.missingPersons,
          missingSightings: parsed.missingSightings || demo.missingSightings,
          imageVerifications: parsed.imageVerifications || demo.imageVerifications
        };
      }
    } catch (err) {
      console.error('Failed to read db file, re-initializing demo database:', err);
    }
    const initial = getInitialDemoData();
    this.saveData(initial);
    return initial;
  }

  public saveData(schema?: DatabaseSchema) {
    if (schema) this.data = schema;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db file:', err);
    }
  }

  public resetDemoData(): DatabaseSchema {
    const demo = getInitialDemoData();
    this.saveData(demo);
    return demo;
  }

  // ----------------------------------------------------
  // INCIDENTS
  // ----------------------------------------------------
  public getIncidents(): Incident[] {
    return this.data.incidents;
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.data.incidents.find(i => i.id === id || i.incidentReference === id);
  }

  public createIncident(incidentData: Omit<Incident, 'id' | 'incidentReference' | 'submittedAt' | 'updatedAt' | 'suggestedPriority' | 'finalPriority' | 'assessment' | 'notifications' | 'timeline'>): Incident {
    const now = new Date().toISOString();
    const id = `INC-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const stateCode = (incidentData.state || 'IN').substring(0, 2).toUpperCase();
    const ref = `GUA-${stateCode}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const assessment = calculateLifeFirstAssessment({
      immediateDanger: incidentData.immediateDanger,
      injurySeverity: incidentData.injurySeverity,
      medicalConditionNotes: incidentData.medicalConditionNotes,
      peopleTrapped: incidentData.peopleTrapped,
      peopleAffected: incidentData.peopleAffected,
      peopleInjured: incidentData.peopleInjured,
      hasVulnerablePeople: incidentData.hasVulnerablePeople,
      isSituationEscalating: incidentData.isSituationEscalating,
      submittedAt: now
    });

    let imageAuthenticity = incidentData.imageAuthenticity;
    if (incidentData.photoUrl && !imageAuthenticity) {
      imageAuthenticity = analyzeImageAuthenticity({
        fileName: 'citizen_evidence.jpg',
        dataUrlOrBase64: incidentData.photoUrl
      });
      this.data.imageVerifications.unshift(imageAuthenticity);
    }

    const newIncident: Incident = {
      ...incidentData,
      id,
      incidentReference: ref,
      submittedAt: now,
      updatedAt: now,
      suggestedPriority: assessment.suggestedPriority,
      finalPriority: assessment.suggestedPriority,
      verificationStatus: incidentData.verificationStatus || 'unverified',
      incidentStatus: 'reported',
      assessment,
      notifications: [],
      imageAuthenticity,
      timeline: [
        {
          id: `AUD-${Date.now()}-1`,
          timestamp: now,
          actor: incidentData.submittedBy?.name || 'Citizen Reporter',
          actorRole: 'Citizen',
          action: 'Incident Submitted',
          notes: 'New emergency report submitted into GUARDIA.'
        },
        {
          id: `AUD-${Date.now()}-2`,
          timestamp: now,
          actor: 'GUARDIA LIFE-FIRST Engine',
          actorRole: 'Automated Prioritisation System',
          action: 'Initial Prioritisation Completed',
          notes: `Assessed Score: ${assessment.score}/100. Priority: ${assessment.suggestedPriority}. ${
            assessment.urgentReviewOverride ? `Urgent Review Triggered (${assessment.urgentReasons.join(', ')})` : ''
          }`
        }
      ],
      isDemo: Boolean(incidentData.isDemo)
    };

    // Auto-create department notifications
    newIncident.notifications = createDepartmentNotifications(newIncident, true);

    // Auto-recommend and assign nearest suitable team if critical P1
    const recommendation = recommendBestResponseTeam(newIncident, this.data.teams);
    if (recommendation && recommendation.team) {
      newIncident.assignedTeamId = recommendation.team.id;
      newIncident.assignedTeamName = recommendation.team.name;
      newIncident.assignedTeamCategory = recommendation.team.category;
      newIncident.assignedDepartment = recommendation.team.department;
      newIncident.distanceKm = recommendation.distanceKm;
      newIncident.etaMinutes = recommendation.etaMinutes;
      newIncident.routeCoordinates = recommendation.routeCoordinates;
      newIncident.teamLocation = {
        latitude: recommendation.team.latitude,
        longitude: recommendation.team.longitude,
        label: `${recommendation.team.location}`
      };
      newIncident.incidentStatus = 'assigned';
      newIncident.assignmentTimestamp = now;

      // Update team availability
      recommendation.team.status = 'assigned';
      recommendation.team.assignedIncidentId = newIncident.id;
      recommendation.team.lastLocationUpdate = now;

      newIncident.timeline.push({
        id: `AUD-${Date.now()}-3`,
        timestamp: now,
        actor: 'Smart Location Assignment Engine',
        actorRole: 'Automated Dispatcher',
        action: 'Team Assigned',
        notes: `Recommended best-fit team: ${recommendation.team.name} (${recommendation.distanceKm} km, ETA ${recommendation.etaMinutes} mins).`
      });
    }

    this.data.incidents.unshift(newIncident);

    // Re-evaluate clusters and duplicates
    this.data.clusters = detectCrisisClusters(this.data.incidents);
    this.data.duplicates = detectDuplicates(this.data.incidents);

    // Notifications
    if (assessment.suggestedPriority === 'P1') {
      this.data.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        type: 'critical_priority',
        title: 'CRITICAL: P1 Incident Logged',
        message: `${newIncident.title} in ${newIncident.locality}, ${newIncident.state} requires immediate command review.`,
        incidentId: newIncident.id,
        timestamp: now,
        read: false,
        severity: 'critical'
      });
    }

    this.saveData();
    return newIncident;
  }

  public updateIncident(id: string, updates: Partial<Incident>, actor = 'Administrator'): Incident | null {
    const index = this.data.incidents.findIndex(i => i.id === id);
    if (index === -1) return null;

    const current = this.data.incidents[index];
    const now = new Date().toISOString();

    const timelineEntry: IncidentAuditEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: now,
      actor,
      actorRole: 'Administrator',
      action: 'Incident Details Modified',
      notes: Object.keys(updates).join(', ')
    };

    const updated = {
      ...current,
      ...updates,
      updatedAt: now,
      timeline: [timelineEntry, ...current.timeline]
    };

    this.data.incidents[index] = updated;
    this.saveData();
    return updated;
  }

  public deleteIncident(id: string): boolean {
    const beforeCount = this.data.incidents.length;
    this.data.incidents = this.data.incidents.filter(i => i.id !== id);
    if (this.data.incidents.length !== beforeCount) {
      this.saveData();
      return true;
    }
    return false;
  }

  public updateIncidentPriority(id: string, newPriority: Incident['finalPriority'], reason: string, actor: string): Incident | null {
    const inc = this.data.incidents.find(i => i.id === id);
    if (!inc) return null;

    const previous = inc.finalPriority;
    const now = new Date().toISOString();
    inc.finalPriority = newPriority;
    inc.priorityOverrideReason = reason;
    inc.priorityOverriddenBy = actor;
    inc.updatedAt = now;

    inc.timeline.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now,
      actor,
      actorRole: 'Administrator',
      action: 'Priority Overridden',
      previousValue: previous,
      updatedValue: newPriority,
      notes: `Reason: ${reason}`
    });

    this.saveData();
    return inc;
  }

  public verifyIncident(id: string, verified: boolean, reason?: string, actor = 'Administrator'): Incident | null {
    const inc = this.data.incidents.find(i => i.id === id);
    if (!inc) return null;

    const now = new Date().toISOString();
    const prevStatus = inc.verificationStatus;
    inc.verificationStatus = verified ? 'verified' : 'rejected';
    if (!verified && reason) {
      inc.rejectionReason = reason;
    }
    inc.updatedAt = now;

    inc.timeline.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now,
      actor,
      actorRole: 'Administrator',
      action: verified ? 'Incident Verified' : 'Incident Rejected',
      previousValue: prevStatus,
      updatedValue: inc.verificationStatus,
      notes: reason || (verified ? 'Report verified by incident commander.' : 'Marked invalid.')
    });

    this.saveData();
    return inc;
  }

  public updateOperationalStatus(id: string, status: Incident['incidentStatus'], actor: string, notes?: string): Incident | null {
    const inc = this.data.incidents.find(i => i.id === id);
    if (!inc) return null;

    const prev = inc.incidentStatus;
    const now = new Date().toISOString();
    inc.incidentStatus = status;
    inc.updatedAt = now;
    if (status === 'resolved' || status === 'closed') {
      inc.resolutionTimestamp = now;
    }

    inc.timeline.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now,
      actor,
      actorRole: 'Operational Responder / Commander',
      action: `Status Changed to ${status.replace('_', ' ').toUpperCase()}`,
      previousValue: prev,
      updatedValue: status,
      notes: notes || `Operational status transitioned to ${status}.`
    });

    this.saveData();
    return inc;
  }

  // ----------------------------------------------------
  // RESPONSE TEAMS & SMART LOCATION ASSIGNMENT
  // ----------------------------------------------------
  public getTeams(): ResponseTeam[] {
    return this.data.teams;
  }

  public getTeamById(id: string): ResponseTeam | undefined {
    return this.data.teams.find(t => t.id === id);
  }

  public createTeam(teamData: Omit<ResponseTeam, 'id' | 'lastLocationUpdate' | 'assignmentHistoryCount'>): ResponseTeam {
    const now = new Date().toISOString();
    const id = `TEAM-${teamData.category.substring(0, 4).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    const newTeam: ResponseTeam = {
      ...teamData,
      id,
      lastLocationUpdate: now,
      assignmentHistoryCount: 0
    };
    this.data.teams.push(newTeam);
    this.saveData();
    return newTeam;
  }

  public updateTeam(id: string, updates: Partial<ResponseTeam>): ResponseTeam | null {
    const team = this.data.teams.find(t => t.id === id);
    if (!team) return null;
    Object.assign(team, updates);
    team.lastLocationUpdate = new Date().toISOString();
    this.saveData();
    return team;
  }

  public updateTeamStatus(id: string, status: TeamAvailabilityStatus, notes?: string): ResponseTeam | null {
    const team = this.data.teams.find(t => t.id === id);
    if (!team) return null;
    const prev = team.status;
    team.status = status;
    team.lastLocationUpdate = new Date().toISOString();

    if (team.assignedIncidentId) {
      const inc = this.data.incidents.find(i => i.id === team.assignedIncidentId);
      if (inc) {
        inc.timeline.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: team.leader,
          actorRole: `${team.name} Leader`,
          action: `Team ${status.replace('_', ' ').toUpperCase()}`,
          notes: notes || `Team status changed from ${prev} to ${status}.`
        });
        if (status === 'on_scene' || status === 'in_progress') {
          inc.incidentStatus = 'in_progress';
        }
      }
    }

    this.saveData();
    return team;
  }

  public updateTeamLocation(id: string, latitude: number, longitude: number, locationName?: string): ResponseTeam | null {
    const team = this.data.teams.find(t => t.id === id);
    if (!team) return null;
    team.latitude = latitude;
    team.longitude = longitude;
    if (locationName) team.location = locationName;
    team.lastLocationUpdate = new Date().toISOString();

    // If assigned to an incident, update route
    if (team.assignedIncidentId) {
      const inc = this.data.incidents.find(i => i.id === team.assignedIncidentId);
      if (inc) {
        inc.teamLocation = { latitude, longitude, label: locationName || team.location };
        inc.routeCoordinates = generateRouteCoordinates(latitude, longitude, inc.latitude, inc.longitude);
      }
    }

    this.saveData();
    return team;
  }

  public assignTeamToIncident(teamId: string, incidentId: string, actor = 'Logistics Command'): { team: ResponseTeam; incident: Incident } | null {
    const team = this.data.teams.find(t => t.id === teamId);
    const inc = this.data.incidents.find(i => i.id === incidentId);
    if (!team || !inc) return null;

    const now = new Date().toISOString();
    const route = generateRouteCoordinates(team.latitude, team.longitude, inc.latitude, inc.longitude);
    const distanceKm = Math.round(Math.hypot(team.latitude - inc.latitude, team.longitude - inc.longitude) * 111 * 10) / 10;
    const etaMinutes = Math.max(2, Math.round((distanceKm / (team.speedKmh || 50)) * 60 + 2));

    team.status = 'assigned';
    team.assignedIncidentId = incidentId;
    team.lastLocationUpdate = now;
    team.assignmentHistoryCount = (team.assignmentHistoryCount || 0) + 1;

    inc.assignedTeamId = team.id;
    inc.assignedTeamName = team.name;
    inc.assignedTeamCategory = team.category;
    inc.assignedDepartment = team.department;
    inc.incidentStatus = 'assigned';
    inc.assignmentTimestamp = now;
    inc.distanceKm = distanceKm;
    inc.etaMinutes = etaMinutes;
    inc.routeCoordinates = route;
    inc.teamLocation = { latitude: team.latitude, longitude: team.longitude, label: team.location };

    inc.timeline.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now,
      actor,
      actorRole: 'Dispatcher',
      action: 'Team Assigned',
      notes: `Assigned ${team.name} (Distance: ${distanceKm} km, ETA: ${etaMinutes} mins).`
    });

    this.data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      type: 'team_assigned',
      title: 'Response Team Mobilized',
      message: `${team.name} deployed to incident ${inc.incidentReference}. ETA ${etaMinutes} mins.`,
      incidentId: inc.id,
      timestamp: now,
      read: false,
      severity: 'high'
    });

    this.saveData();
    return { team, incident: inc };
  }

  public releaseTeamFromIncident(teamId: string, actor = 'Incident Commander'): ResponseTeam | null {
    const team = this.data.teams.find(t => t.id === teamId);
    if (!team) return null;

    const oldIncId = team.assignedIncidentId;
    const now = new Date().toISOString();
    team.status = 'available';
    team.assignedIncidentId = undefined;
    team.lastLocationUpdate = now;

    if (oldIncId) {
      const inc = this.data.incidents.find(i => i.id === oldIncId);
      if (inc) {
        inc.timeline.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: now,
          actor,
          actorRole: 'Commander',
          action: 'Team Demobilized',
          notes: `${team.name} released from assignment back to available status.`
        });
      }
    }

    this.saveData();
    return team;
  }

  // ----------------------------------------------------
  // SOS NOW ALERTS
  // ----------------------------------------------------
  public getSOSAlerts(): SOSAlert[] {
    return this.data.sosAlerts;
  }

  public createSOSAlert(alertData: Omit<SOSAlert, 'id' | 'timestamp' | 'status' | 'lastLocationUpdate' | 'notificationsSent'>): SOSAlert {
    const now = new Date().toISOString();
    const id = `SOS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const notificationsSent = (alertData.emergencyContacts || []).map(contact => ({
      contactName: contact.name,
      phone: contact.phone,
      channel: 'sms' as const,
      status: 'simulated' as const,
      sentAt: now
    }));

    const newSOS: SOSAlert = {
      ...alertData,
      id,
      timestamp: now,
      status: 'activated',
      lastLocationUpdate: now,
      notificationsSent,
      isDemo: Boolean(alertData.isDemo)
    };

    // Find nearest suitable response team
    const dummyIncident: Incident = {
      id: `INC-${id}`,
      incidentReference: id,
      title: `SOS Alert: ${alertData.emergencyCategory.toUpperCase()}`,
      description: 'Emergency SOS activated by citizen.',
      category: alertData.emergencyCategory,
      latitude: alertData.latitude,
      longitude: alertData.longitude,
      state: 'National',
      district: 'Local Zone',
      locality: alertData.locality,
      peopleAffected: 1,
      peopleInjured: 1,
      injurySeverity: 'life_threatening',
      peopleTrapped: false,
      immediateDanger: true,
      hasVulnerablePeople: false,
      isSituationEscalating: true,
      severity: 'critical',
      suggestedPriority: 'P1',
      finalPriority: 'P1',
      verificationStatus: 'verified',
      incidentStatus: 'reported',
      submittedAt: now,
      updatedAt: now,
      submittedBy: { name: alertData.citizenName, phone: alertData.citizenPhone, isAnonymous: false },
      assessment: {} as any,
      notifications: [],
      timeline: [],
      isDemo: true
    };

    const recommendation = recommendBestResponseTeam(dummyIncident, this.data.teams);
    if (recommendation && recommendation.team) {
      newSOS.assignedTeamId = recommendation.team.id;
      newSOS.assignedTeamName = recommendation.team.name;
      newSOS.status = 'team_assigned';
      recommendation.team.status = 'assigned';
      recommendation.team.lastLocationUpdate = now;
    }

    this.data.sosAlerts.unshift(newSOS);

    // Platform notification
    this.data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      type: 'sos_alert',
      title: 'EMERGENCY SOS ACTIVATED',
      message: `${alertData.citizenName} triggered SOS in ${alertData.locality}. Urgent life safety review.`,
      sosId: newSOS.id,
      timestamp: now,
      read: false,
      severity: 'critical'
    });

    this.saveData();
    return newSOS;
  }

  public updateSOSStatus(id: string, status: SOSStatus, assignedTeamId?: string, notes?: string): SOSAlert | null {
    const alert = this.data.sosAlerts.find(s => s.id === id);
    if (!alert) return null;
    alert.status = status;
    alert.lastLocationUpdate = new Date().toISOString();
    if (assignedTeamId) {
      alert.assignedTeamId = assignedTeamId;
      const team = this.data.teams.find(t => t.id === assignedTeamId);
      if (team) {
        alert.assignedTeamName = team.name;
        team.status = 'assigned';
      }
    }
    if (notes) alert.notes = notes;
    this.saveData();
    return alert;
  }

  // ----------------------------------------------------
  // FAMILY LINK — REUNIFICATION & CENTRES
  // ----------------------------------------------------
  public getFamilyGroups(): FamilyGroup[] {
    return this.data.familyGroups;
  }

  public getFamilyGroupById(id: string): FamilyGroup | undefined {
    return this.data.familyGroups.find(g => g.id === id || g.invitationCode === id);
  }

  public createFamilyGroup(groupData: Omit<FamilyGroup, 'id' | 'invitationCode' | 'createdAt'>): FamilyGroup {
    const id = `FAM-${Math.floor(1000 + Math.random() * 9000)}`;
    const invitationCode = `GUARDIA-FAM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newGroup: FamilyGroup = {
      ...groupData,
      id,
      invitationCode,
      createdAt: new Date().toISOString()
    };
    this.data.familyGroups.push(newGroup);
    this.saveData();
    return newGroup;
  }

  public joinFamilyGroup(invitationCode: string, member: FamilyMember): FamilyGroup | null {
    const group = this.data.familyGroups.find(g => g.invitationCode.toUpperCase() === invitationCode.trim().toUpperCase());
    if (!group) return null;
    const existingIndex = group.members.findIndex(m => m.phone === member.phone);
    if (existingIndex >= 0) {
      group.members[existingIndex] = member;
    } else {
      group.members.push(member);
    }
    this.saveData();
    return group;
  }

  public checkInFamilyMember(
    groupId: string, 
    memberId: string, 
    status: FamilySafetyStatus, 
    locationName?: string, 
    coords?: { lat: number; lng: number },
    notes?: string
  ): FamilyGroup | null {
    const group = this.data.familyGroups.find(g => g.id === groupId);
    if (!group) return null;
    const member = group.members.find(m => m.id === memberId);
    if (!member) return null;

    member.safetyStatus = status;
    member.locationTimestamp = new Date().toISOString();
    if (locationName) member.lastSharedLocation = locationName;
    if (coords) {
      member.latitude = coords.lat;
      member.longitude = coords.lng;
    }
    if (notes) member.checkInNotes = notes;

    this.saveData();
    return group;
  }

  public getReunificationCentres(): ReunificationCentre[] {
    return this.data.reunificationCentres;
  }

  public createReunificationCentre(data: Omit<ReunificationCentre, 'id'>): ReunificationCentre {
    const id = `RC-${(data.state || 'IN').substring(0, 2).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    const newCentre: ReunificationCentre = { ...data, id };
    this.data.reunificationCentres.push(newCentre);
    this.saveData();
    return newCentre;
  }

  // ----------------------------------------------------
  // FINDER — MISSING PERSON COORDINATION
  // ----------------------------------------------------
  public getMissingPersons(): MissingPersonCase[] {
    return this.data.missingPersons;
  }

  public getMissingPersonById(id: string): MissingPersonCase | undefined {
    return this.data.missingPersons.find(m => m.id === id);
  }

  public createMissingPersonCase(data: Omit<MissingPersonCase, 'id' | 'status' | 'sightingsCount' | 'reportedAt' | 'updatedAt'>): MissingPersonCase {
    const now = new Date().toISOString();
    const id = `MP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCase: MissingPersonCase = {
      ...data,
      id,
      status: 'newly_reported',
      sightingsCount: 0,
      reportedAt: now,
      updatedAt: now
    };
    this.data.missingPersons.unshift(newCase);
    this.saveData();
    return newCase;
  }

  public updateMissingPersonStatus(id: string, status: MissingPersonStatus, searchTeamId?: string): MissingPersonCase | null {
    const mp = this.data.missingPersons.find(m => m.id === id);
    if (!mp) return null;
    mp.status = status;
    mp.updatedAt = new Date().toISOString();
    if (searchTeamId) {
      mp.assignedSearchTeamId = searchTeamId;
      const team = this.data.teams.find(t => t.id === searchTeamId);
      if (team) mp.assignedSearchTeamName = team.name;
    }
    this.saveData();
    return mp;
  }

  public getMissingSightings(caseId?: string): MissingPersonSighting[] {
    if (caseId) {
      return this.data.missingSightings.filter(s => s.caseId === caseId);
    }
    return this.data.missingSightings;
  }

  public createMissingSighting(data: Omit<MissingPersonSighting, 'id' | 'status' | 'submittedAt'>): MissingPersonSighting {
    const now = new Date().toISOString();
    const id = `SIGHT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSighting: MissingPersonSighting = {
      ...data,
      id,
      status: 'unverified_sighting',
      submittedAt: now
    };
    this.data.missingSightings.unshift(newSighting);

    const mp = this.data.missingPersons.find(m => m.id === data.caseId);
    if (mp) {
      mp.sightingsCount = (mp.sightingsCount || 0) + 1;
      mp.updatedAt = now;
      if (mp.status === 'newly_reported') {
        mp.status = 'possible_sighting';
      }
    }

    this.data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      type: 'missing_sighting',
      title: 'New Missing Person Sighting',
      message: `A sighting for ${mp?.fullName || 'missing individual'} was submitted in ${data.sightingLocation}. Marked UNVERIFIED SIGHTING.`,
      caseId: data.caseId,
      timestamp: now,
      read: false,
      severity: 'high'
    });

    this.saveData();
    return newSighting;
  }

  public verifyMissingSighting(sightingId: string, verified: boolean, verifiedBy = 'Administrator', notes?: string): MissingPersonSighting | null {
    const s = this.data.missingSightings.find(item => item.id === sightingId);
    if (!s) return null;
    s.status = verified ? 'verified_sighting' : 'rejected';
    s.verifiedBy = verifiedBy;
    if (notes) s.reviewNotes = notes;

    if (verified) {
      const mp = this.data.missingPersons.find(m => m.id === s.caseId);
      if (mp) {
        mp.status = 'located';
        mp.updatedAt = new Date().toISOString();
      }
    }

    this.saveData();
    return s;
  }

  // ----------------------------------------------------
  // REALITY CHECK — IMAGE VERIFICATIONS
  // ----------------------------------------------------
  public getImageVerifications(): ImageAuthenticityResult[] {
    return this.data.imageVerifications;
  }

  public recordImageVerification(result: ImageAuthenticityResult) {
    this.data.imageVerifications.unshift(result);
    this.saveData();
  }

  public reviewImageVerification(id: string, action: 'approved' | 'rejected' | 'flagged', reviewer: string, notes?: string): ImageAuthenticityResult | null {
    const rec = this.data.imageVerifications.find(r => r.id === id);
    if (!rec) return null;
    rec.reviewAction = action;
    rec.reviewedBy = reviewer;
    if (notes) rec.reviewNotes = notes;
    this.saveData();
    return rec;
  }

  // ----------------------------------------------------
  // DEPARTMENT NOTIFICATIONS & BRIDGE
  // ----------------------------------------------------
  public acknowledgeDepartmentNotification(notifId: string, responderName: string, notes?: string): DepartmentNotification | null {
    for (const inc of this.data.incidents) {
      const notif = inc.notifications.find(n => n.id === notifId);
      if (notif) {
        const now = new Date().toISOString();
        notif.status = 'acknowledged';
        notif.acknowledgedAt = now;
        notif.acknowledgedBy = responderName;
        if (notes) notif.responseNotes = notes;

        inc.timeline.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: now,
          actor: responderName,
          actorRole: `${notif.department.toUpperCase()} Commander`,
          action: 'Department Acknowledged Notification',
          notes: notes || `${notif.departmentName} acknowledged receipt and assigned dispatch unit.`
        });

        this.data.notifications.unshift({
          id: `NOTIF-${Date.now()}`,
          type: 'department_ack',
          title: `${notif.departmentName} Acknowledged`,
          message: `${responderName} acknowledged incident ${inc.incidentReference}.`,
          incidentId: inc.id,
          timestamp: now,
          read: false,
          severity: 'medium'
        });

        this.saveData();
        return notif;
      }
    }
    return null;
  }

  public updateDepartmentStatus(
    notifId: string, 
    newStatus: 'response_initiated' | 'completed', 
    responderName: string, 
    notes?: string
  ): DepartmentNotification | null {
    for (const inc of this.data.incidents) {
      const notif = inc.notifications.find(n => n.id === notifId);
      if (notif) {
        const now = new Date().toISOString();
        notif.status = newStatus;
        if (newStatus === 'response_initiated') {
          notif.responseInitiatedAt = now;
        } else if (newStatus === 'completed') {
          notif.completedAt = now;
        }
        if (notes) notif.responseNotes = notes;

        inc.timeline.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: now,
          actor: responderName,
          actorRole: `${notif.department.toUpperCase()} Field Response`,
          action: newStatus === 'response_initiated' ? 'Field Response Initiated' : 'Department Mission Completed',
          notes: notes || `Response status updated to ${newStatus}.`
        });

        this.saveData();
        return notif;
      }
    }
    return null;
  }

  // ----------------------------------------------------
  // RESOURCES
  // ----------------------------------------------------
  public getResources(): EmergencyResource[] {
    return this.data.resources;
  }

  public assignResource(resourceId: string, incidentId: string): EmergencyResource | null {
    const res = this.data.resources.find(r => r.id === resourceId);
    const inc = this.data.incidents.find(i => i.id === incidentId);
    if (!res || !inc) return null;

    const now = new Date().toISOString();
    res.status = 'assigned';
    res.assignedIncidentId = incidentId;
    res.assignedAt = now;
    res.lastUpdated = now;

    if (!inc.assignedResourceIds) inc.assignedResourceIds = [];
    if (!inc.assignedResourceIds.includes(resourceId)) {
      inc.assignedResourceIds.push(resourceId);
    }

    inc.timeline.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now,
      actor: 'Logistics Command',
      actorRole: 'Resource Dispatcher',
      action: 'Emergency Resource Assigned',
      notes: `Deployed ${res.name} to scene.`
    });

    this.saveData();
    return res;
  }

  public releaseResource(resourceId: string): EmergencyResource | null {
    const res = this.data.resources.find(r => r.id === resourceId);
    if (!res) return null;

    const oldIncidentId = res.assignedIncidentId;
    const now = new Date().toISOString();
    res.status = 'available';
    res.assignedIncidentId = undefined;
    res.assignedAt = undefined;
    res.lastUpdated = now;

    if (oldIncidentId) {
      const inc = this.data.incidents.find(i => i.id === oldIncidentId);
      if (inc && inc.assignedResourceIds) {
        inc.assignedResourceIds = inc.assignedResourceIds.filter(id => id !== resourceId);
        inc.timeline.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: now,
          actor: 'Logistics Command',
          actorRole: 'Resource Dispatcher',
          action: 'Emergency Resource Demobilized',
          notes: `${res.name} released back to available pool.`
        });
      }
    }

    this.saveData();
    return res;
  }

  // ----------------------------------------------------
  // CLUSTERS & DUPLICATES
  // ----------------------------------------------------
  public getClusters(): CrisisCluster[] {
    return this.data.clusters;
  }

  public verifyCluster(clusterId: string, verified: boolean): CrisisCluster | null {
    const c = this.data.clusters.find(cl => cl.id === clusterId);
    if (!c) return null;
    c.status = verified ? 'verified' : 'dismissed';
    this.saveData();
    return c;
  }

  public getDuplicates(): DuplicateSuggestion[] {
    return this.data.duplicates;
  }

  public resolveDuplicate(duplicateId: string, action: 'linked' | 'confirmed_duplicate' | 'dismissed'): DuplicateSuggestion | null {
    const d = this.data.duplicates.find(dp => dp.id === duplicateId);
    if (!d) return null;
    d.status = action;
    
    if (action === 'confirmed_duplicate' || action === 'linked') {
      const inc = this.data.incidents.find(i => i.id === d.duplicateIncidentId);
      if (inc) {
        inc.potentialDuplicateOf = d.primaryIncidentId;
      }
    }
    this.saveData();
    return d;
  }

  // ----------------------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------------------
  public getNotifications(): PlatformNotification[] {
    return this.data.notifications;
  }

  public markNotificationRead(id: string): void {
    const n = this.data.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.saveData();
    }
  }

  public markAllNotificationsRead(): void {
    this.data.notifications.forEach(n => n.read = true);
    this.saveData();
  }

  public getUsers(): User[] {
    return this.data.users;
  }
}

export const db = new GuardiaDatabase();
