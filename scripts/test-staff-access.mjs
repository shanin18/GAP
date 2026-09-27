import assert from 'node:assert/strict';
import { assignedRecords, assignedDocuments } from '../payload/access.ts';
import { assignStaffCreator, validateStaffApplication } from '../payload/hooks/staff-ownership.ts';
import { Leads } from '../payload/collections/Leads.ts';
import { Applications } from '../payload/collections/Applications.ts';
import { Documents } from '../payload/collections/Documents.ts';

const admin = { id: 1, role: 'admin' };
const staff = { id: 8, role: 'editor' };
for (const access of [assignedRecords, assignedDocuments]) {
  assert.equal(access({ req: { user: null } }), false);
  assert.equal(access({ req: { user: admin } }), true);
}
assert.deepEqual(assignedRecords({ req: { user: staff } }), { assignedTo: { equals: 8 } });
assert.deepEqual(assignedDocuments({ req: { user: staff } }), { 'application.assignedTo': { equals: 8 } });
for (const config of [Leads, Applications]) {
  assert.equal(config.access.read, assignedRecords);
  assert.equal(config.access.update, assignedRecords);
  const assignment = config.fields.find(f => f.name === 'assignedTo');
  for (const action of ['create', 'update']) {
    assert.equal(assignment.access[action]({ req: { user: staff } }), false);
    assert.equal(assignment.access[action]({ req: { user: admin } }), true);
  }
}
assert.equal(Documents.access.read, assignedDocuments);
assert.equal(Documents.access.update, assignedDocuments);
assert.deepEqual(assignStaffCreator({ data: { assignedTo: 99 }, operation: 'create', req: { user: staff } }), { assignedTo: 8 });
assert.deepEqual(assignStaffCreator({ data: {}, operation: 'create', req: { user: null } }), {});
assert.deepEqual(assignStaffCreator({ data: { assignedTo: 99 }, operation: 'create', req: { user: admin } }), { assignedTo: 99 });

let query;
const req = { user: staff, payload: { count: async args => { query = args; return { totalDocs: 1 }; } } };
await validateStaffApplication({ data: { application: 42 }, req });
assert.equal(query.overrideAccess, false);
assert.deepEqual(query.where.and, [{ id: { equals: 42 } }, { assignedTo: { equals: 8 } }]);
req.payload.count = async () => ({ totalDocs: 0 });
await assert.rejects(validateStaffApplication({ data: { application: 99 }, req }), /assigned to your account/);
await assert.rejects(validateStaffApplication({ data: {}, originalDoc: { application: 99 }, req }), /assigned to your account/);
await validateStaffApplication({ data: { application: null }, req });
console.log('Staff access tests passed: ownership filters, assignments, public creation, document scope and cross-account links.');
