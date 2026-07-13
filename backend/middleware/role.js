// Restricts a route to one or more roles. Use after `protect`.
// Example: router.post("/", protect, authorize("super_admin", "auditor"), handler)
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user on request");
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Role '${req.user.role}' is not permitted to perform this action`
      );
    }
    next();
  };
};
