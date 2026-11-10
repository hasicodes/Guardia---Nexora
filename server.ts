import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';
import { evaluateDynamicReassessment } from './server/lifeFirstEngine.ts';
import { recommendBestResponseTeam } from './server/teamAssignmentEngine.ts';
import { analyzeImageAuthenticity } from './server/realityCheckEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// ----------------------------------------------------
// AUTHENTICATION APIs
// ----------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, role, department } = req.body;
  const users = db.getUsers();
  
  let user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) {
    if (role === 'admin') {
      user = users.find(u => u.role === 'admin');
    } else if (role === 'department') {
      user = users.find(u => u.role === 'department' && (department ? u.department === department : true));
    } else {
      user = users.find(u => u.role === 'citizen');
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'User not recognized' });
  }

  return res.json({ success: true, user });
});

app.get('/api/auth/users', (_req: Request, res: Response) => {
  res.json({ users: db.getUsers() });
});

// ----------------------------------------------------
// INCIDENT APIs
// ----------------------------------------------------
app.get('/api/incidents', (req: Request, res: Response) => {
  let incidents = db.getIncidents();
  const { category, priority, status, state, district, search } = req.query;

  if (category && category !== 'all') {
    incidents = incidents.filter(i => i.category === category);
  }
  if (priority && priority !== 'all') {
    incidents = incidents.filter(i => i.finalPriority === priority);
  }
  if (status && status !== 'all') {
    incidents = incidents.filter(i => i.incidentStatus === status);
  }
  if (state && state !== 'all') {
    incidents = incidents.filter(i => i.state.toLowerCase() === String(state).toLowerCase());
  }
  if (district && district !== 'all') {
    incidents = incidents.filter(i => i.district.toLowerCase() === String(district).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase();
    incidents = incidents.filter(i => 
      i.title.toLowerCase().includes(q) ||
      i.incidentReference.toLowerCase().includes(q) ||
      i.locality.toLowerCase().includes(q) ||
      i.district.toLowerCase().includes(q) ||
      i.state.toLowerCase().includes(q)
    );
  }

  res.json({ incidents, total: incidents.length });
});

app.get('/api/incidents/:id', (req: Request, res: Response) => {
  const incident = db.getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json({ incident });
});

app.post('/api/incidents', (req: Request, res: Response) => {
  const data = req.body;
  if (!data.title || !data.category || !data.state || !data.district) {
    return res.status(400).json({ error: 'Missing mandatory incident fields (title, category, state, district).' });
  }

  const newIncident = db.createIncident({
    title: data.title,
    description: data.description || '',
    category: data.category,
    latitude: Number(data.latitude) || 20.5937,
    longitude: Number(data.longitude) || 78.9629,
    state: data.state,
    district: data.district,
    locality: data.locality || `${data.district}, ${data.state}`,
    peopleAffected: Number(data.peopleAffected) || 1,
    peopleInjured: Number(data.peopleInjured) || 0,
    injurySeverity: data.injurySeverity || 'unknown',
    peopleTrapped: Boolean(data.peopleTrapped),
    immediateDanger: Boolean(data.immediateDanger),
    medicalConditionNotes: data.medicalConditionNotes || '',
    hasVulnerablePeople: Boolean(data.hasVulnerablePeople),
    isSituationEscalating: Boolean(data.isSituationEscalating),
    severity: data.severity || 'high',
    verificationStatus: 'unverified',
    incidentStatus: 'reported',
    submittedBy: data.submittedBy || { name: 'Citizen Reporter', isAnonymous: false },
    photoUrl: data.photoUrl,
    isDemo: Boolean(data.isDemo)
  });

  res.status(201).json({ 
    success: true, 
    incident: newIncident, 
    message: 'Your emergency report has been submitted successfully.',
    incidentReference: newIncident.incidentReference 
  });
});

app.put('/api/incidents/:id', (req: Request, res: Response) => {
  const updated = db.updateIncident(req.params.id, req.body, req.body.actor || 'Administrator');
  if (!updated) return res.status(404).json({ error: 'Incident not found' });
  res.json({ success: true, incident: updated });
});

app.delete('/api/incidents/:id', (req: Request, res: Response) => {
  const deleted = db.deleteIncident(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Incident not found' });
  res.json({ success: true, message: 'Incident record removed' });
});

app.post('/api/incidents/:id/verify', (req: Request, res: Response) => {
  const { verified, reason, actor } = req.body;
  const result = db.verifyIncident(req.params.id, verified, reason, actor);
  if (!result) return res.status(404).json({ error: 'Incident not found' });
  res.json({ success: true, incident: result });
});

app.post('/api/incidents/:id/update-priority', (req: Request, res: Response) => {
  const { priority, reason, actor } = req.body;
  if (!priority || !reason) {
    return res.status(400).json({ error: 'Priority and justification reason are required.' });
  }
  const result = db.updateIncidentPriority(req.params.id, priority, reason, actor || 'Aditya Vardhan');
  if (!result) return res.status(404).json({ error: 'Incident not found' });
  res.json({ success: true, incident: result });
});

app.post('/api/incidents/:id/reassess', (req: Request, res: Response) => {
  const incident = db.getIncidentById(req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const { newInfo, actor } = req.body;
  const reassessResult = evaluateDynamicReassessment(incident, newInfo || {});

  const updatedIncident = db.updateIncident(
    incident.id, 
    {
      ...newInfo,
      assessment: reassessResult.newAssessment,
      suggestedPriority: reassessResult.newAssessment.suggestedPriority,
      finalPriority: reassessResult.escalated ? reassessResult.newAssessment.suggestedPriority : incident.finalPriority
    },
    actor || 'Dynamic Reassessment Engine'
  );

  res.json({
    success: true,
    incident: updatedIncident,
    escalated: reassessResult.escalated,
    reason: reassessResult.reason
  });
});

app.post('/api/incidents/:id/status', (req: Request, res: Response) => {
  const { status, actor, notes } = req.body;
  const updated = db.updateOperationalStatus(req.params.id, status, actor || 'Commander', notes);
  if (!updated) return res.status(404).json({ error: 'Incident not found' });
  res.json({ success: true, incident: updated });
});

// ----------------------------------------------------
// RESPONSE TEAMS & LOCATION-BASED SMART ASSIGNMENT
// ----------------------------------------------------
app.get('/api/teams', (_req: Request, res: Response) => {
  res.json({ teams: db.getTeams() });
});

app.post('/api/teams', (req: Request, res: Response) => {
  const team = db.createTeam(req.body);
  res.status(201).json({ success: true, team });
});

app.put('/api/teams/:id', (req: Request, res: Response) => {
  const updated = db.updateTeam(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Team not found' });
  res.json({ success: true, team: updated });
});

app.post('/api/teams/:id/status', (req: Request, res: Response) => {
  const { status, notes } = req.body;
  const updated = db.updateTeamStatus(req.params.id, status, notes);
  if (!updated) return res.status(404).json({ error: 'Team not found' });
  res.json({ success: true, team: updated });
});

app.post('/api/teams/:id/location', (req: Request, res: Response) => {
  const { latitude, longitude, locationName } = req.body;
  const updated = db.updateTeamLocation(req.params.id, Number(latitude), Number(longitude), locationName);
  if (!updated) return res.status(404).json({ error: 'Team not found' });
  res.json({ success: true, team: updated });
});

app.post('/api/teams/:id/release', (req: Request, res: Response) => {
  const team = db.releaseTeamFromIncident(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json({ success: true, team });
});

// Recommend best-fit team for an incident based on location and category
app.get('/api/incidents/:id/recommend-teams', (req: Request, res: Response) => {
  const incident = db.getIncidentById(req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const recommendation = recommendBestResponseTeam(incident, db.getTeams());
  if (!recommendation) return res.status(404).json({ error: 'No suitable response team available in service area.' });

  res.json({ success: true, recommendation });
});

// Assign team to incident
app.post('/api/incidents/:id/assign-team', (req: Request, res: Response) => {
  const { teamId, actor } = req.body;
  if (!teamId) return res.status(400).json({ error: 'teamId is required.' });

  const result = db.assignTeamToIncident(teamId, req.params.id, actor || 'Logistics Commander');
  if (!result) return res.status(404).json({ error: 'Incident or Team not found' });

  res.json({ success: true, ...result });
});

// ----------------------------------------------------
// SOS NOW — EMERGENCY SOS SYSTEM APIs
// ----------------------------------------------------
app.get('/api/sos', (_req: Request, res: Response) => {
  res.json({ alerts: db.getSOSAlerts() });
});

app.post('/api/sos', (req: Request, res: Response) => {
  const alert = db.createSOSAlert(req.body);
  res.status(201).json({ success: true, alert, sosId: alert.id });
});

app.post('/api/sos/:id/status', (req: Request, res: Response) => {
  const { status, assignedTeamId, notes } = req.body;
  const updated = db.updateSOSStatus(req.params.id, status, assignedTeamId, notes);
  if (!updated) return res.status(404).json({ error: 'SOS alert not found' });
  res.json({ success: true, alert: updated });
});

// ----------------------------------------------------
// FAMILY LINK — REUNIFICATION & CENTRES APIs
// ----------------------------------------------------
app.get('/api/family-link/groups', (_req: Request, res: Response) => {
  res.json({ groups: db.getFamilyGroups() });
});

app.post('/api/family-link/groups', (req: Request, res: Response) => {
  const group = db.createFamilyGroup(req.body);
  res.status(201).json({ success: true, group });
});

app.post('/api/family-link/join', (req: Request, res: Response) => {
  const { invitationCode, member } = req.body;
  const group = db.joinFamilyGroup(invitationCode, member);
  if (!group) return res.status(404).json({ error: 'Invalid family group invitation code' });
  res.json({ success: true, group });
});

app.post('/api/family-link/check-in', (req: Request, res: Response) => {
  const { groupId, memberId, status, locationName, coords, notes } = req.body;
  const group = db.checkInFamilyMember(groupId, memberId, status, locationName, coords, notes);
  if (!group) return res.status(404).json({ error: 'Family group or member not found' });
  res.json({ success: true, group });
});

app.get('/api/family-link/centres', (_req: Request, res: Response) => {
  res.json({ centres: db.getReunificationCentres() });
});

app.post('/api/family-link/centres', (req: Request, res: Response) => {
  const centre = db.createReunificationCentre(req.body);
  res.status(201).json({ success: true, centre });
});

// ----------------------------------------------------
// FINDER — MISSING PERSON APIs
// ----------------------------------------------------
app.get('/api/finder/cases', (_req: Request, res: Response) => {
  res.json({ cases: db.getMissingPersons() });
});

app.post('/api/finder/cases', (req: Request, res: Response) => {
  const newCase = db.createMissingPersonCase(req.body);
  res.status(201).json({ success: true, case: newCase });
});

app.post('/api/finder/cases/:id/status', (req: Request, res: Response) => {
  const { status, searchTeamId } = req.body;
  const updated = db.updateMissingPersonStatus(req.params.id, status, searchTeamId);
  if (!updated) return res.status(404).json({ error: 'Case not found' });
  res.json({ success: true, case: updated });
});

app.get('/api/finder/sightings', (req: Request, res: Response) => {
  const { caseId } = req.query;
  res.json({ sightings: db.getMissingSightings(caseId ? String(caseId) : undefined) });
});

app.post('/api/finder/sightings', (req: Request, res: Response) => {
  const sighting = db.createMissingSighting(req.body);
  res.status(201).json({ success: true, sighting });
});

app.post('/api/finder/sightings/:id/verify', (req: Request, res: Response) => {
  const { verified, verifiedBy, notes } = req.body;
  const sighting = db.verifyMissingSighting(req.params.id, verified, verifiedBy, notes);
  if (!sighting) return res.status(404).json({ error: 'Sighting not found' });
  res.json({ success: true, sighting });
});

// ----------------------------------------------------
// REALITY CHECK — AI IMAGE VERIFICATION APIs
// ----------------------------------------------------
app.get('/api/reality-check/verifications', (_req: Request, res: Response) => {
  res.json({ verifications: db.getImageVerifications() });
});

app.post('/api/reality-check/verify', (req: Request, res: Response) => {
  const { fileName, dataUrl, fileSizeKb, mimeType } = req.body;
  const result = analyzeImageAuthenticity({ fileName, dataUrlOrBase64: dataUrl, fileSizeKb, mimeType });
  db.recordImageVerification(result);
  res.json({ success: true, result });
});

app.post('/api/reality-check/review', (req: Request, res: Response) => {
  const { id, action, reviewer, notes } = req.body;
  const updated = db.reviewImageVerification(id, action, reviewer, notes);
  if (!updated) return res.status(404).json({ error: 'Verification record not found' });
  res.json({ success: true, record: updated });
});

// ----------------------------------------------------
// RESCUE BRIDGE - DEPARTMENT COORDINATION APIs
// ----------------------------------------------------
app.get('/api/departments/notifications', (req: Request, res: Response) => {
  const { department } = req.query;
  const incidents = db.getIncidents();
  const allNotifs: any[] = [];

  incidents.forEach(inc => {
    inc.notifications.forEach(notif => {
      if (!department || department === 'all' || notif.department === department) {
        allNotifs.push({
          notification: notif,
          incident: {
            id: inc.id,
            reference: inc.incidentReference,
            title: inc.title,
            category: inc.category,
            locality: inc.locality,
            district: inc.district,
            state: inc.state,
            priority: inc.finalPriority,
            peopleAffected: inc.peopleAffected,
            peopleInjured: inc.peopleInjured,
            injurySeverity: inc.injurySeverity,
            peopleTrapped: inc.peopleTrapped,
            submittedAt: inc.submittedAt
          }
        });
      }
    });
  });

  res.json({ notifications: allNotifs });
});

app.post('/api/departments/notifications/:id/acknowledge', (req: Request, res: Response) => {
  const { responderName, notes } = req.body;
  const ack = db.acknowledgeDepartmentNotification(req.params.id, responderName || 'Duty Commander', notes);
  if (!ack) return res.status(404).json({ error: 'Notification not found' });
  res.json({ success: true, notification: ack });
});

app.post('/api/departments/notifications/:id/update-status', (req: Request, res: Response) => {
  const { status, responderName, notes } = req.body;
  const updated = db.updateDepartmentStatus(req.params.id, status, responderName || 'Lead Responder', notes);
  if (!updated) return res.status(404).json({ error: 'Notification not found' });
  res.json({ success: true, notification: updated });
});

// ----------------------------------------------------
// CRISIS PULSE & DUPLICATE APIs
// ----------------------------------------------------
app.get('/api/clusters', (_req: Request, res: Response) => {
  res.json({ clusters: db.getClusters() });
});

app.post('/api/clusters/:id/verify', (req: Request, res: Response) => {
  const { verified } = req.body;
  const c = db.verifyCluster(req.params.id, Boolean(verified));
  if (!c) return res.status(404).json({ error: 'Cluster not found' });
  res.json({ success: true, cluster: c });
});

app.get('/api/duplicates', (_req: Request, res: Response) => {
  res.json({ duplicates: db.getDuplicates() });
});

app.post('/api/duplicates/:id/resolve', (req: Request, res: Response) => {
  const { action } = req.body;
  const dup = db.resolveDuplicate(req.params.id, action);
  if (!dup) return res.status(404).json({ error: 'Duplicate suggestion not found' });
  res.json({ success: true, duplicate: dup });
});

// ----------------------------------------------------
// RESOURCE MANAGEMENT APIs
// ----------------------------------------------------
app.get('/api/resources', (_req: Request, res: Response) => {
  res.json({ resources: db.getResources() });
});

app.post('/api/resources/:id/assign', (req: Request, res: Response) => {
  const { incidentId } = req.body;
  const resUnit = db.assignResource(req.params.id, incidentId);
  if (!resUnit) return res.status(404).json({ error: 'Resource or Incident not found' });
  res.json({ success: true, resource: resUnit });
});

app.post('/api/resources/:id/release', (req: Request, res: Response) => {
  const resUnit = db.releaseResource(req.params.id);
  if (!resUnit) return res.status(404).json({ error: 'Resource not found' });
  res.json({ success: true, resource: resUnit });
});

// ----------------------------------------------------
// ADVANCED ANALYTICS OVERVIEW API
// ----------------------------------------------------
app.get('/api/analytics/overview', (_req: Request, res: Response) => {
  const incidents = db.getIncidents();
  const resources = db.getResources();
  const teams = db.getTeams();
  const sosAlerts = db.getSOSAlerts();
  const missingPersons = db.getMissingPersons();
  const familyGroups = db.getFamilyGroups();

  const totalIncidents = incidents.length;
  const criticalP1 = incidents.filter(i => i.finalPriority === 'P1').length;
  const urgentP2 = incidents.filter(i => i.finalPriority === 'P2').length;
  const moderateP3 = incidents.filter(i => i.finalPriority === 'P3').length;
  const lowP4 = incidents.filter(i => i.finalPriority === 'P4').length;

  const pendingVerification = incidents.filter(i => i.verificationStatus === 'unverified').length;
  const verifiedCount = incidents.filter(i => i.verificationStatus === 'verified').length;
  const assignedIncidents = incidents.filter(i => i.incidentStatus === 'assigned').length;
  const inProgress = incidents.filter(i => i.incidentStatus === 'in_progress').length;
  const resolved = incidents.filter(i => i.incidentStatus === 'resolved' || i.incidentStatus === 'closed').length;

  const totalAffected = incidents.reduce((sum, i) => sum + (i.peopleAffected || 0), 0);
  const totalInjured = incidents.reduce((sum, i) => sum + (i.peopleInjured || 0), 0);
  const totalTrapped = incidents.filter(i => i.peopleTrapped).reduce((sum, i) => sum + (i.peopleAffected || 0), 0);

  // Teams
  const availableTeams = teams.filter(t => t.status === 'available' || t.status === 'returning').length;
  const busyTeams = teams.filter(t => t.status === 'assigned' || t.status === 'en_route' || t.status === 'on_scene' || t.status === 'in_progress').length;

  // New modules
  const activeSOS = sosAlerts.filter(s => s.status !== 'resolved' && s.status !== 'cancelled').length;
  const activeMissingPersons = missingPersons.filter(m => m.status !== 'reunited' && m.status !== 'closed').length;
  const familyCases = familyGroups.length;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  incidents.forEach(i => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  // State counts
  const stateCounts: Record<string, number> = {};
  incidents.forEach(i => {
    stateCounts[i.state] = (stateCounts[i.state] || 0) + 1;
  });

  // Resource availability
  const availableResources = resources.filter(r => r.status === 'available').length;
  const assignedResources = resources.filter(r => r.status === 'assigned' || r.status === 'in_use').length;

  const allNotifs = incidents.flatMap(i => i.notifications);
  const acknowledgedNotifs = allNotifs.filter(n => n.acknowledgedAt);
  const ackRate = allNotifs.length > 0 ? Math.round((acknowledgedNotifs.length / allNotifs.length) * 100) : 0;

  res.json({
    totalIncidents,
    criticalP1,
    urgentP2,
    moderateP3,
    lowP4,
    pendingVerification,
    verifiedCount,
    assignedIncidents,
    inProgress,
    resolved,
    totalAffected,
    totalInjured,
    totalTrapped,
    categoryCounts,
    stateCounts,
    availableResources,
    assignedResources,
    totalResources: resources.length,
    availableTeams,
    busyTeams,
    totalTeams: teams.length,
    activeSOS,
    activeMissingPersons,
    familyCases,
    ackRate
  });
});

// ----------------------------------------------------
// NOTIFICATIONS & AUDIT APIs
// ----------------------------------------------------
app.get('/api/notifications', (_req: Request, res: Response) => {
  res.json({ notifications: db.getNotifications() });
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

app.post('/api/notifications/read-all', (_req: Request, res: Response) => {
  db.markAllNotificationsRead();
  res.json({ success: true });
});

app.post('/api/demo/reset', (_req: Request, res: Response) => {
  db.resetDemoData();
  res.json({ success: true, message: 'GUARDIA demonstration database successfully restored to default scenario.' });
});

// ----------------------------------------------------
// VITE DEV SERVER / STATIC PRODUCTION SERVING
// ----------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GUARDIA] National Emergency Command Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
