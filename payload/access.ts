import type { Access, FieldAccess } from 'payload';

export const publicRead: Access = () => true;
export const isLoggedIn: Access = ({ req }) => Boolean(req.user);
export const isAdmin: Access = ({ req }) => req.user?.role === 'admin';
export const isAdminField: FieldAccess = ({ req }) => req.user?.role === 'admin';

/** Visitors see published items only; staff see everything. */
export const publishedOrStaff: Access = ({ req }) =>
  req.user ? true : { status: { equals: 'published' } };

/** Same for testimonials, which use a "published" checkbox. */
export const publishedFlagOrStaff: Access = ({ req }) =>
  req.user ? true : { published: { equals: true } };
