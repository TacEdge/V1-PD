// Second prep pass: form templates use the { questions: [...] } shape with
// fieldType; variations go through the form-style endpoint with formData.
import { apiLogin, api } from './capture-lib.mjs';

const admin = await apiLogin('admin');
const project = (await api(admin, 'GET', '/api/projects')).json[0];

const q = (id, label, fieldType, extra = {}) => ({ id, label, fieldType, required: false, ...extra });

const templates = [
  {
    name: 'Job Safety Analysis (JSA)', type: 'crew-briefing', dailySigninEnabled: true,
    description: 'Site JSA with daily crew sign-in',
    schema: { questions: [
      q('task', 'Task being assessed', 'text', { required: true }),
      q('hazards', 'Key hazards identified', 'textarea', { required: true, defaultValue: 'Rockfall · working at height · plant movement' }),
      q('controls', 'Controls in place', 'textarea', { required: true }),
      q('ppe', 'PPE confirmed', 'checkbox', { options: ['Hard hat', 'Hi-vis', 'Gloves', 'Eye protection'] }),
      q('sig', 'Supervisor signature', 'signature'),
    ] },
  },
  {
    name: 'Incident Report', type: 'incident-report',
    description: 'Report an incident or injury',
    schema: { questions: [
      q('what', 'What happened?', 'textarea', { required: true }),
      q('where', 'Location', 'text', { required: true }),
      q('when', 'Date of incident', 'date', { required: true }),
      q('severity', 'Severity', 'radio', { options: ['Low', 'Medium', 'High'], required: true }),
      q('actions', 'Immediate actions taken', 'textarea'),
    ] },
  },
  {
    name: 'Take 5 — Pre-task Check', type: 'take-5',
    description: 'Stop, look, assess, manage, proceed',
    schema: { questions: [
      q('task', 'Task', 'text', { required: true }),
      q('assessed', 'Hazards assessed?', 'radio', { options: ['Yes', 'No'], required: true }),
      q('safe', 'Safe to proceed?', 'radio', { options: ['Yes', 'No'], required: true }),
    ] },
  },
];
for (const t of templates) {
  const r = await api(admin, 'POST', '/api/form-templates', t);
  console.log('template', t.name, r.status, r.status >= 400 ? JSON.stringify(r.json).slice(0, 160) : '');
}

const v = await api(admin, 'POST', '/api/variations', {
  projectId: project.id,
  formData: {
    title: 'Additional row of rock pins — Zone 1 crest',
    reason: 'ground-conditions',
    description: 'Loose block identified above row A during scaling; four additional RB16G pins proposed.',
  },
  sendToTeams: false,
});
console.log('variation', v.status, v.status >= 400 ? JSON.stringify(v.json).slice(0, 160) : '');
console.log('done');
