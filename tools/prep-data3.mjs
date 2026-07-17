// Third prep pass: project team membership for scoped roles + a seeded report.
import { apiLogin, api } from './capture-lib.mjs';

const admin = await apiLogin('admin');
const project = (await api(admin, 'GET', '/api/projects')).json[0];
const users = (await api(admin, 'GET', '/api/settings/users')).json;
const byEmail = Object.fromEntries((users.users || users).map((u) => [u.email, u]));

for (const [email, role] of [
  ['pm@rockcontrol.app', 'Project Manager'],
  ['super@rockcontrol.app', 'Site Supervisor'],
  ['field@rockcontrol.app', 'Driller'],
]) {
  const u = byEmail[email];
  if (!u) { console.log('missing user', email); continue; }
  const r = await api(admin, 'POST', `/api/projects/${project.id}/team`, {
    name: u.name, role, email: undefined, userId: u.id,
  });
  console.log('team', email, r.status);
}

const rep = await api(admin, 'POST', `/api/projects/${project.id}/reports`, {
  templateKey: 'anchor-acceptance-test',
  title: 'Anchor Acceptance Test Report — Zone 1',
});
console.log('report', rep.status, rep.json?.id || JSON.stringify(rep.json).slice(0, 140));
