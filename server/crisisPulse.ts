import { Incident, CrisisCluster } from '../src/types/index.ts';

function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function detectCrisisClusters(incidents: Incident[]): CrisisCluster[] {
  const clusters: CrisisCluster[] = [];
  const processedIncidentIds = new Set<string>();

  // Only consider active/recent incidents
  const activeIncidents = incidents.filter(i => 
    i.incidentStatus !== 'resolved' && 
    i.incidentStatus !== 'closed' && 
    i.verificationStatus !== 'rejected'
  );

  for (let i = 0; i < activeIncidents.length; i++) {
    const primary = activeIncidents[i];
    if (processedIncidentIds.has(primary.id)) continue;

    const nearby: Incident[] = [primary];

    for (let j = 0; j < activeIncidents.length; j++) {
      if (i === j) continue;
      const candidate = activeIncidents[j];
      if (processedIncidentIds.has(candidate.id)) continue;

      const distKm = getHaversineDistanceKm(
        primary.latitude, primary.longitude,
        candidate.latitude, candidate.longitude
      );

      // Proximity threshold: within 18 km
      if (distKm <= 18) {
        // Time window: within 8 hours of each other
        const t1 = new Date(primary.submittedAt).getTime();
        const t2 = new Date(candidate.submittedAt).getTime();
        const diffHours = Math.abs(t1 - t2) / (1000 * 60 * 60);

        if (diffHours <= 8) {
          nearby.push(candidate);
        }
      }
    }

    // A cluster requires at least 2 geographically co-located incidents
    if (nearby.length >= 2) {
      nearby.forEach(item => processedIncidentIds.add(item.id));

      const centerLat = nearby.reduce((acc, cur) => acc + cur.latitude, 0) / nearby.length;
      const centerLon = nearby.reduce((acc, cur) => acc + cur.longitude, 0) / nearby.length;
      const totalAffected = nearby.reduce((acc, cur) => acc + (cur.peopleAffected || 0), 0);
      const totalInjured = nearby.reduce((acc, cur) => acc + (cur.peopleInjured || 0), 0);
      
      const categories = Array.from(new Set(nearby.map(n => n.category)));
      const hasP1 = nearby.some(n => n.finalPriority === 'P1');
      const hasP2 = nearby.some(n => n.finalPriority === 'P2');

      const primaryPriority = hasP1 ? 'P1' : (hasP2 ? 'P2' : 'P3');

      // Cluster name based on locality and nature
      const sample = nearby[0];
      const clusterName = `${sample.district} Regional Emergency Cluster (${categories.map(c => c.replace('_', ' ').toUpperCase()).join(' + ')})`;

      clusters.push({
        id: `CLS-${sample.state.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        name: clusterName,
        centerLatitude: parseFloat(centerLat.toFixed(4)),
        centerLongitude: parseFloat(centerLon.toFixed(4)),
        radiusKm: 18,
        incidentIds: nearby.map(n => n.id),
        categories,
        totalAffected,
        totalInjured,
        primaryPriority,
        state: sample.state,
        district: sample.district,
        status: 'suggested',
        detectedAt: new Date().toISOString()
      });
    }
  }

  return clusters;
}
