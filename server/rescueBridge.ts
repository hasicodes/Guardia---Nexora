import { Incident, DepartmentNotification, DepartmentType } from '../src/types/index.ts';

export function determineRequiredDepartments(incident: Incident): DepartmentType[] {
  const depts: DepartmentType[] = [];

  switch (incident.category) {
    case 'fire':
      depts.push('fire');
      if (incident.peopleInjured > 0 || incident.injurySeverity !== 'none' || incident.peopleTrapped) {
        depts.push('ambulance');
      }
      if (incident.peopleAffected > 5 || incident.isSituationEscalating) {
        depts.push('police');
      }
      break;

    case 'road_accident':
      depts.push('police');
      depts.push('ambulance');
      if (incident.peopleTrapped || incident.immediateDanger) {
        depts.push('fire'); // Extrication equipment
      }
      break;

    case 'medical':
      depts.push('ambulance');
      if (incident.immediateDanger && incident.peopleAffected > 3) {
        depts.push('police');
      }
      break;

    case 'flood':
      depts.push('fire'); // Water rescue units
      depts.push('police');
      if (incident.peopleInjured > 0 || incident.peopleTrapped) {
        depts.push('ambulance');
      }
      break;

    case 'building_collapse':
      depts.push('fire'); // Search and rescue
      depts.push('ambulance');
      depts.push('police'); // Perimeter control
      break;

    case 'other':
    default:
      depts.push('police');
      if (incident.peopleInjured > 0) {
        depts.push('ambulance');
      }
      break;
  }

  return Array.from(new Set(depts));
}

const DEPARTMENT_NAMES: Record<DepartmentType, string> = {
  police: 'State Police Command',
  fire: 'Fire & Rescue Services',
  ambulance: 'Emergency Medical Services (108/Ambulance)',
  disaster: 'State Disaster Response Force (SDRF)',
  search_and_rescue: 'Search & Rescue Command'
};

export function createDepartmentNotifications(incident: Incident, autoSend = true): DepartmentNotification[] {
  const targetDepts = determineRequiredDepartments(incident);
  const now = new Date().toISOString();

  return targetDepts.map(dept => ({
    id: `NOTIF-${dept.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
    incidentId: incident.id,
    department: dept,
    departmentName: DEPARTMENT_NAMES[dept],
    status: autoSend ? 'sent' : 'queued',
    queuedAt: now,
    sentAt: autoSend ? now : undefined,
    deliveredAt: autoSend ? new Date(Date.now() + 1500).toISOString() : undefined,
    isSimulated: true // Clearly labelled as simulated prototype dispatch
  }));
}
