export const initials = (name = '') =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();

export const money = (amount) => (amount == null ? null : `$${Number(amount).toLocaleString()}`);

export const salaryRange = (min, max) => {
    if (min == null && max == null) return 'Salary not specified';
    if (min == null) return `Up to ${money(max)}`;
    if (max == null) return `From ${money(min)}`;
    return `${money(min)} - ${money(max)}`;
};

/** Permission / role checks used for conditional rendering. */
export const can = (user, permission) => Boolean(user?.permissions?.includes(permission));
export const hasRole = (user, role) => Boolean(user?.roles?.includes(role));

export const SETUP_LABELS = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-Site' };
