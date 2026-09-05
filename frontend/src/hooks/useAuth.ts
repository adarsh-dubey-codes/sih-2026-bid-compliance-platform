import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useAuthContext();
  const currentRole = context.role || context.profile?.role || 'PROCUREMENT_OFFICER';
  const roleUpper = typeof currentRole === 'string' ? currentRole.toUpperCase() : '';

  return {
    ...context,
    isAdmin: () => roleUpper === 'ADMIN',
    isOfficer: () => roleUpper === 'PROCUREMENT_OFFICER' || roleUpper === 'OFFICER',
    isBidder: () => roleUpper === 'BIDDER',
    isAuditor: () => roleUpper === 'AUDITOR',
  };
};

