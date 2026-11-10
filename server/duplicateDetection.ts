import { Incident, DuplicateSuggestion } from '../src/types/index.ts';

function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function wordSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(text2.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  let matches = 0;
  for (const w of words1) {
    if (words2.has(w)) matches++;
  }
  return (2 * matches) / (words1.size + words2.size);
}

export function detectDuplicates(incidents: Incident[]): DuplicateSuggestion[] {
  const suggestions: DuplicateSuggestion[] = [];
  const processedPairs = new Set<string>();

  for (let i = 0; i < incidents.length; i++) {
    for (let j = i + 1; j < incidents.length; j++) {
      const a = incidents[i];
      const b = incidents[j];

      const pairKey = `${a.id}_${b.id}`;
      if (processedPairs.has(pairKey)) continue;

      const distKm = getHaversineDistanceKm(a.latitude, a.longitude, b.latitude, b.longitude);
      const isSameCategory = a.category === b.category;
      
      const timeDiffMinutes = Math.abs(
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      ) / (1000 * 60);

      const matchingFactors: string[] = [];
      let score = 0;

      // Distance score
      if (distKm < 0.3) {
        score += 45;
        matchingFactors.push(`Immediate geographic co-location (< ${(distKm * 1000).toFixed(0)}m)`);
      } else if (distKm < 1.5) {
        score += 30;
        matchingFactors.push(`Close vicinity (< ${distKm.toFixed(1)} km)`);
      }

      // Category score
      if (isSameCategory) {
        score += 25;
        matchingFactors.push(`Matching emergency category (${a.category.replace('_', ' ')})`);
      }

      // Time proximity score
      if (timeDiffMinutes < 30) {
        score += 20;
        matchingFactors.push(`Reported within ${(timeDiffMinutes).toFixed(0)} mins`);
      } else if (timeDiffMinutes < 180) {
        score += 10;
        matchingFactors.push(`Reported within ${(timeDiffMinutes / 60).toFixed(1)} hrs`);
      }

      // Description / title similarity
      const textSim = wordSimilarity(`${a.title} ${a.description}`, `${b.title} ${b.description}`);
      if (textSim > 0.4) {
        score += 20;
        matchingFactors.push('Strong textual description overlap');
      } else if (textSim > 0.2) {
        score += 10;
        matchingFactors.push('Moderate keyword overlap');
      }

      // Threshold for flagging potential duplicate
      if (score >= 60 && distKm < 2.0) {
        processedPairs.add(pairKey);
        suggestions.push({
          id: `DUP-${Math.floor(1000 + Math.random() * 9000)}`,
          primaryIncidentId: a.id,
          duplicateIncidentId: b.id,
          confidenceScore: Math.min(score, 98),
          matchingFactors,
          status: 'pending',
          detectedAt: new Date().toISOString()
        });
      }
    }
  }

  return suggestions;
}
