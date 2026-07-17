// Populates the LOCAL disposable V1 runtime with small fictional fixtures so
// list screens photograph in realistic populated states. All writes go to the
// local throwaway database only — nothing external is configured or reachable.
import { apiLogin, api } from './capture-lib.mjs';

const admin = await apiLogin('admin');
const projects = await api(admin, 'GET', '/api/projects');
const project = projects.json[0];
console.log('project:', project.name, project.id);

// ---- DAS specs: positions, home base, personnel, plant --------------------
const positions = [
  { name: 'Driller', chargeRate: '95' },
  { name: 'Offsider', chargeRate: '70' },
  { name: 'Supervisor', chargeRate: '110' },
];
const posIds = {};
for (const p of positions) {
  const r = await api(admin, 'POST', '/api/das/positions', p);
  posIds[p.name] = r.json?.id;
  console.log('position', p.name, r.status);
}
const hb = await api(admin, 'POST', '/api/das/home-bases', { name: 'Cromwell Yard' });
console.log('home base', hb.status);
const personnel = [
  { name: 'Frankie Tane', positionId: posIds['Driller'], homeBaseId: hb.json?.id },
  { name: 'Sam Keller', positionId: posIds['Supervisor'], homeBaseId: hb.json?.id },
  { name: 'Rangi Broome', positionId: posIds['Offsider'], homeBaseId: hb.json?.id },
];
const persIds = [];
for (const p of personnel) {
  const r = await api(admin, 'POST', '/api/das/personnel', p);
  persIds.push(r.json?.id);
  console.log('personnel', p.name, r.status);
}
const plant = [
  { name: 'Drill rig — DR-01', category: 'drill-mast', registration: 'FIC123', dayRate: '850' },
  { name: 'Compressor — CP-02', category: 'compressor', registration: 'FIC456', dayRate: '220' },
];
const plantIds = [];
for (const p of plant) {
  const r = await api(admin, 'POST', '/api/das/plant', p);
  plantIds.push(r.json?.id);
  console.log('plant', p.name, r.status);
}
// Assign crew + plant to the project
for (const id of persIds.filter(Boolean)) {
  const r = await api(admin, 'POST', `/api/projects/${project.id}/das-crew`, { personnelId: id });
  console.log('das-crew', r.status);
}
for (const id of plantIds.filter(Boolean)) {
  const r = await api(admin, 'POST', `/api/projects/${project.id}/das-plant`, { plantId: id });
  console.log('das-plant', r.status);
}

// ---- Form templates -------------------------------------------------------
const jsa = await api(admin, 'POST', '/api/form-templates', {
  name: 'Job Safety Analysis (JSA)',
  type: 'crew-briefing',
  description: 'Site JSA with daily crew sign-in',
  dailySigninEnabled: true,
  schema: { fields: [
    { id: 'task', type: 'text', label: 'Task being assessed', required: true },
    { id: 'hazards', type: 'textarea', label: 'Key hazards identified', required: true },
    { id: 'controls', type: 'textarea', label: 'Controls in place', required: true },
    { id: 'ppe', type: 'checkbox', label: 'PPE confirmed', options: ['Hard hat', 'Hi-vis', 'Gloves', 'Eye protection'] },
  ] },
});
console.log('JSA template', jsa.status);

const incident = await api(admin, 'POST', '/api/form-templates', {
  name: 'Incident Report',
  type: 'incident-report',
  description: 'Report an incident or injury',
  schema: { fields: [
    { id: 'what', type: 'textarea', label: 'What happened?', required: true },
    { id: 'where', type: 'text', label: 'Location', required: true },
    { id: 'when', type: 'date', label: 'Date of incident', required: true },
    { id: 'severity', type: 'radio', label: 'Severity', options: ['Low', 'Medium', 'High'], required: true },
    { id: 'actions', type: 'textarea', label: 'Immediate actions taken' },
  ] },
});
console.log('Incident template', incident.status);

const take5 = await api(admin, 'POST', '/api/form-templates', {
  name: 'Take 5 — Pre-task Check',
  type: 'take-5',
  description: 'Stop, look, assess, manage, proceed',
  schema: { fields: [
    { id: 'task', type: 'text', label: 'Task', required: true },
    { id: 'assessed', type: 'radio', label: 'Hazards assessed?', options: ['Yes', 'No'], required: true },
    { id: 'safe', type: 'radio', label: 'Safe to proceed?', options: ['Yes', 'No'], required: true },
  ] },
});
console.log('Take-5 template', take5.status);

// ---- A note, an asset, a meeting, a variation ------------------------------
const note = await api(admin, 'POST', '/api/notes', {
  projectId: project.id,
  title: 'Seepage at 2.1 m — Zone 1',
  body: 'Minor water ingress noted while drilling A6 at ~2.1 m. Grout take normal. Monitor on next row.',
});
console.log('note', note.status);

const asset = await api(admin, 'POST', '/api/assets', {
  name: 'Hydraulic jack — HJ-30',
  category: 'testing',
  assetCode: 'HJ-30',
  certType: 'Calibration',
  certExpiry: '2026-11-30',
  status: 'in-service',
  notes: 'Used for anchor proof tests.',
});
console.log('asset', asset.status);

const meeting = await api(admin, 'POST', '/api/safety-meetings', {
  title: 'Toolbox talk — Riverview Cutting',
  type: 'toolbox-talk',
  projectId: project.id,
  scheduledFor: new Date().toISOString(),
  location: 'Site office',
  agenda: 'Rockfall watch, drill sequencing for row B, weather window.',
});
console.log('meeting', meeting.status, meeting.json?.id || meeting.json);

const variation = await api(admin, 'POST', '/api/variations', {
  projectId: project.id,
  title: 'Additional row of rock pins — Zone 1 crest',
  reason: 'ground-conditions',
  description: 'Loose block identified above row A during scaling; four additional RB16G pins proposed.',
  status: 'draft',
});
console.log('variation', variation.status);

console.log('prep complete');
