import { APIError, type CollectionBeforeChangeHook } from 'payload';

/** New staff-created cases belong to their creator; only admins can reassign. */
export const assignStaffCreator: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation === 'create' && req.user?.role === 'editor') data.assignedTo = req.user.id;
  return data;
};

/** Do not allow a staff member to attach data to somebody else's application. */
export const validateStaffApplication: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  if (req.user?.role !== 'editor') return data;
  const value = data.application === undefined ? originalDoc?.application : data.application;
  const id = value && typeof value === 'object' ? value.id : value;
  if (id) {
    const { totalDocs } = await req.payload.count({
      collection: 'applications', req, overrideAccess: false,
      where: { and: [{ id: { equals: id } }, { assignedTo: { equals: req.user.id } }] },
    });
    if (!totalDocs) throw new APIError('Choose an application assigned to your account.', 403);
  }
  return data;
};
