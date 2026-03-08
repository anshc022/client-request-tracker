import { getRequests, checkDbConnection } from './actions';
import Dashboard from '@/components/Dashboard';

export default async function Home() {
  const requests = await getRequests();
  const isDbConnected = await checkDbConnection();

  return <Dashboard initialRequests={requests} isDbConnected={isDbConnected} />;
}
