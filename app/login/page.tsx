import WorkerLogin from "./worker-log";
import AdminLogin from "./admin-log";

export const metadata = {
  title: "Worker Login | ForeSite",
  description: "Sign in to ForeSite safety portal",
};

export default function LoginPage() {
  return <WorkerLogin />;
}
