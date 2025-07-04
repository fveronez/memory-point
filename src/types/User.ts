export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    admin: number;
    manager: number;
    support: number;
  };
}
