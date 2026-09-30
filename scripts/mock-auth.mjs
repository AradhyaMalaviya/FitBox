export const useAuth = () => ({
  user: { id: "test-user", authUserId: "test-auth-id", profileId: "test-profile-id" },
  authUserId: "test-auth-id",
  profileId: "test-profile-id",
});
export const AuthProvider = ({ children }) => children;
