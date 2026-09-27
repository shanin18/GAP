import type { Access, FieldAccess } from 'payload';

export const publicRead: Access = () => true;
export const isLoggedIn: Access = ({ req }) => Boolean(req.user);
export const isAdmin: Access = ({ req }) => req.user?.role === 'admin';
export const isAdminField: FieldAccess = ({ req }) => req.user?.role === 'admin';

/** CRM ownership is enforced for lists, individual records and API requests. */
export const assignedRecords: Access = ({ req }) => {
  if (!req.user) return false;
  if (req.user.role === 'admin') return true;
  return { assignedTo: { equals: req.user.id } };
};

export const assignedDocuments: Access = ({ req }) => {
  if (!req.user) return false;
  if (req.user.role === 'admin') return true;
  return { 'application.assignedTo': { equals: req.user.id } };
};

/** Visitors see published items only; staff see everything. */
export const publishedOrStaff: Access = ({ req }) =>
  req.user ? true : { status: { equals: 'published' } };

/** Same for testimonials, which use a "published" checkbox. */
export const publishedFlagOrStaff: Access = ({ req }) =>
  req.user ? true : { published: { equals: true } };
