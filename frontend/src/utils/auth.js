export const getRoleName = (user) => {
  if (!user) return "";
  if (typeof user.role === "string") return user.role;
  if (user.role && typeof user.role === "object") return user.role.name || "";
  if (typeof user.role_name === "string") return user.role_name;
  if (typeof user.roleName === "string") return user.roleName;
  return "";
};

export const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    role: getRoleName(user),
    roleDetails: user.role && typeof user.role === "object" ? user.role : user.roleDetails,
  };
};
