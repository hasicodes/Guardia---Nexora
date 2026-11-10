export type EmergencyCategory = 
  | 'fire'
  | 'road_accident'
  | 'medical'
  | 'flood'
  | 'building_collapse'
  | 'other';

export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';

export type IncidentStatus = 
  | 'reported'
  | 'pending'
  | 'verified'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type VerificationStatus = 'unverified' | 'verified' | 'rejected';

export type InjurySeverity = 
  | 'none'
  | 'minor'
  | 'serious'
  | 'life_threatening'
  | 'unknown';

export type DepartmentType = 'police' | 'fire' | 'ambulance' | 'disaster' | 'search_and_rescue';

export type NotificationDeliveryStatus = 
  | 'not_sent'
  | 'queued'
  | 'sent'
  | 'delivery_confirmed'
  | 'acknowledged'
  | 'response_initiated'
  | 'completed'
  | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'admin' | 'department';
  department?: DepartmentType;
  badgeNumber?: string;
}

export interface LifeFirstAssessment {
  score: number; // 0 - 100
  suggestedPriority: PriorityLevel;
  urgentReviewOverride: boolean;
  urgentReasons: string[];
  factors: {
    threatToLife: { score: number; weight: number; contribution: number; label: string };
    injurySeverity: { score: number; weight: number; contribution: number; label: string };
    medicalCondition: { score: number; weight: number; contribution: number; label: string };
    peopleTrapped: { score: number; weight: number; contribution: number; label: string };
    peopleAffected: { score: number; weight: number; contribution: number; label: string };
    vulnerableIndividuals: { score: number; weight: number; contribution: number; label: string };
    incidentProgression: { score: number; weight: number; contribution: number; label: string };
    waitingTime: { score: number; weight: number; contribution: number; label: string };
  };
  missingInformation: string[];
  assessedAt: string;
}

export interface DepartmentNotification {
  id: string;
  incidentId: string;
  department: string;
  departmentName: string;
  status: NotificationDeliveryStatus;
  queuedAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  responseInitiatedAt?: string;
  completedAt?: string;
  responseNotes?: string;
  isSimulated: boolean;
}

export interface IncidentAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  previousValue?: string;
  updatedValue?: string;
  notes?: string;
}

// ----------------------------------------------------
// REALITY CHECK — AI IMAGE AUTHENTICITY VERIFICATION
// ----------------------------------------------------
export type ImageAuthenticityStatus = 
  | 'verified_real'
  | 'likely_real'
  | 'ai_generated'
  | 'manipulated'
  | 'unverified'
  | 'rejected';

export interface ImageAuthenticityResult {
  id: string;
  status: ImageAuthenticityStatus;
  confidenceScore: number; // 0 - 100
  fileName: string;
  fileSizeKb: number;
  mimeType: string;
  dimensions: { width: number; height: number };
  cryptographicHash: string;
  metadataStatus: 'intact' | 'stripped' | 'modified';
  provenanceCredentials: 'c2pa_present' | 'not_found' | 'synthetic_watermark';
  syntheticIndicators: string[];
  manipulationIndicators: string[];
  detectorVersion: string;
  explanation: string;
  reviewedBy?: string;
  reviewAction?: 'approved' | 'rejected' | 'flagged';
  reviewNotes?: string;
  verifiedAt: string;
}

export interface Incident {
  id: string;
  incidentReference: string; // e.g. GUA-2026-7841
  title: string;
  description: string;
  category: EmergencyCategory;
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  locality: string;
  peopleAffected: number;
  peopleInjured: number;
  injurySeverity: InjurySeverity;
  peopleTrapped: boolean;
  immediateDanger: boolean;
  medicalConditionNotes?: string;
  hasVulnerablePeople: boolean;
  isSituationEscalating: boolean;
  
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedPriority: PriorityLevel;
  finalPriority: PriorityLevel;
  priorityOverrideReason?: string;
  priorityOverriddenBy?: string;
  
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  incidentStatus: IncidentStatus;
  
  submittedAt: string;
  updatedAt: string;
  submittedBy: {
    name: string;
    phone?: string;
    isAnonymous: boolean;
  };
  
  photoUrl?: string;
  imageAuthenticity?: ImageAuthenticityResult;

  assessment: LifeFirstAssessment;
  notifications: DepartmentNotification[];
  timeline: IncidentAuditEntry[];
  
  // Team Assignment & Live Tracking
  assignedTeamId?: string;
  assignedTeamName?: string;
  assignedTeamCategory?: ResponseCategory;
  assignedDepartment?: string;
  teamLocation?: { latitude: number; longitude: number; label: string };
  distanceKm?: number;
  etaMinutes?: number;
  assignmentTimestamp?: string;
  resolutionTimestamp?: string;
  routeCoordinates?: [number, number][];

  linkedClusterId?: string;
  potentialDuplicateOf?: string;
  assignedResourceIds?: string[];
  isDemo: boolean;
}

// ----------------------------------------------------
// RESPONSE TEAM MANAGEMENT & LOCATION-BASED ASSIGNMENT
// ----------------------------------------------------
export type ResponseCategory = 
  | 'fire_rescue'
  | 'medical_ambulance'
  | 'police'
  | 'disaster_response'
  | 'search_and_rescue'
  | 'other';

export type TeamAvailabilityStatus = 
  | 'available'
  | 'assigned'
  | 'en_route'
  | 'on_scene'
  | 'in_progress'
  | 'returning'
  | 'unavailable';

export interface ResponseTeam {
  id: string;
  name: string;
  category: ResponseCategory;
  department: string;
  leader: string;
  memberCount: number;
  location: string;
  latitude: number;
  longitude: number;
  status: TeamAvailabilityStatus;
  assignedIncidentId?: string;
  equipment: string[];
  capabilities: string[];
  speedKmh: number;
  lastLocationUpdate: string;
  assignmentHistoryCount: number;
  isSimulated: boolean;
}

export interface TeamRecommendation {
  team: ResponseTeam;
  distanceKm: number;
  etaMinutes: number;
  suitabilityScore: number; // 0 - 100
  suitabilityReason: string;
  routeCoordinates: [number, number][];
  alternativeTeams: Array<{
    team: ResponseTeam;
    distanceKm: number;
    etaMinutes: number;
    suitabilityReason: string;
  }>;
}

// ----------------------------------------------------
// SOS NOW — EMERGENCY SOS SYSTEM
// ----------------------------------------------------
export type SOSStatus = 
  | 'activated'
  | 'pending_review'
  | 'acknowledged'
  | 'team_assigned'
  | 'en_route'
  | 'assistance_provided'
  | 'resolved'
  | 'cancelled';

export interface SOSContactNotification {
  contactName: string;
  phone: string;
  channel: 'sms' | 'in_app' | 'push' | 'email';
  status: 'sent' | 'delivered' | 'simulated';
  sentAt: string;
}

export interface SOSAlert {
  id: string; // e.g. SOS-2026-8912
  citizenId?: string;
  citizenName: string;
  citizenPhone?: string;
  emergencyCategory: EmergencyCategory;
  latitude: number;
  longitude: number;
  locality: string;
  locationAccuracyMeters: number;
  timestamp: string;
  emergencyContacts: Array<{ name: string; phone: string }>;
  status: SOSStatus;
  assignedTeamId?: string;
  assignedTeamName?: string;
  assignedIncidentId?: string;
  notes?: string;
  lastLocationUpdate: string;
  notificationsSent: SOSContactNotification[];
  isDemo: boolean;
}

// ----------------------------------------------------
// FAMILY LINK — EMERGENCY FAMILY REUNIFICATION
// ----------------------------------------------------
export type FamilySafetyStatus = 
  | 'safe'
  | 'need_assistance'
  | 'missing'
  | 'evacuating'
  | 'sheltered'
  | 'injured'
  | 'at_reunification_centre'
  | 'location_unknown';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  safetyStatus: FamilySafetyStatus;
  lastSharedLocation?: string;
  latitude?: number;
  longitude?: number;
  locationTimestamp?: string;
  locationSharingPermission: boolean;
  checkInNotes?: string;
}

export interface FamilyGroup {
  id: string; // e.g. FAM-7812
  name: string;
  adminId: string;
  adminName: string;
  invitationCode: string;
  members: FamilyMember[];
  emergencyContacts: Array<{ name: string; phone: string }>;
  preferredMeetingPoint: string;
  reunificationCentreId?: string;
  createdAt: string;
}

export interface ReunificationCentre {
  id: string;
  name: string;
  type: 'emergency_shelter' | 'relief_camp' | 'hospital' | 'police_station' | 'reunification_centre';
  address: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  capacity: number;
  availableCapacity: number;
  facilities: string[];
  contact: string;
  operationalStatus: 'open' | 'near_capacity' | 'full' | 'closed';
}

// ----------------------------------------------------
// FINDER — MISSING PERSON COORDINATION
// ----------------------------------------------------
export type MissingPersonStatus = 
  | 'newly_reported'
  | 'under_verification'
  | 'search_active'
  | 'possible_sighting'
  | 'located'
  | 'reunification_pending'
  | 'reunited'
  | 'closed';

export interface MissingPersonCase {
  id: string; // e.g. MP-2026-4412
  fullName: string;
  age: number;
  gender: string;
  photoUrl: string;
  dateTimeLastSeen: string;
  lastKnownLocation: string;
  lastKnownLatitude: number;
  lastKnownLongitude: number;
  clothingDescription: string;
  physicalDescription: string;
  identifyingCharacteristics: string;
  medicalOrAccessibilityNeeds?: string;
  circumstances: string;
  reportingPersonName: string;
  reportingPersonContact: string;
  policeReportReference?: string;
  status: MissingPersonStatus;
  sightingsCount: number;
  assignedSearchTeamId?: string;
  assignedSearchTeamName?: string;
  reportedAt: string;
  updatedAt: string;
}

export interface MissingPersonSighting {
  id: string;
  caseId: string;
  sightingLocation: string;
  latitude: number;
  longitude: number;
  sightingTime: string;
  description: string;
  photoUrl?: string;
  reporterName?: string;
  reporterContact?: string;
  status: 'unverified_sighting' | 'verified_sighting' | 'rejected';
  confidenceScore: number; // AI-assisted photo similarity confidence
  submittedAt: string;
  verifiedBy?: string;
  reviewNotes?: string;
}

// ----------------------------------------------------
// CRISIS CLUSTERS & DUPLICATES
// ----------------------------------------------------
export interface CrisisCluster {
  id: string;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  incidentIds: string[];
  categories: EmergencyCategory[];
  totalAffected: number;
  totalInjured: number;
  primaryPriority: PriorityLevel;
  state: string;
  district: string;
  status: 'suggested' | 'verified' | 'dismissed';
  detectedAt: string;
}

export interface DuplicateSuggestion {
  id: string;
  primaryIncidentId: string;
  duplicateIncidentId: string;
  confidenceScore: number; // 0 - 100
  matchingFactors: string[];
  status: 'pending' | 'linked' | 'confirmed_duplicate' | 'dismissed';
  detectedAt: string;
}

// ----------------------------------------------------
// EMERGENCY RESOURCES (EXPANDED)
// ----------------------------------------------------
export interface EmergencyResource {
  id: string;
  name: string;
  type: 'ambulance' | 'fire_unit' | 'police_pcr' | 'rescue_boat' | 'heavy_rescue' | 'medical_supplies' | 'emergency_shelter' | 'medical_facility';
  department: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'assigned' | 'in_use' | 'unavailable';
  assignedIncidentId?: string;
  assignedAt?: string;
  crewCount: number;
  capacity?: number;
  lastUpdated: string;
}

export interface PlatformNotification {
  id: string;
  type: 
    | 'critical_priority' 
    | 'escalation' 
    | 'new_report' 
    | 'cluster_detected' 
    | 'duplicate_detected' 
    | 'department_ack' 
    | 'status_change'
    | 'sos_alert'
    | 'team_assigned'
    | 'missing_sighting'
    | 'image_verification_alert';
  title: string;
  message: string;
  incidentId?: string;
  sosId?: string;
  caseId?: string;
  timestamp: string;
  read: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
