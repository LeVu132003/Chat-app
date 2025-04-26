declare module "@/components/AuthGuard" {
  interface AuthGuardProps {
    children: React.ReactNode;
  }

  const AuthGuard: React.FC<AuthGuardProps>;
  export default AuthGuard;
}
