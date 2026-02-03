import Layout, { TabType } from './components/common/Layout';
import Dashboard from './components/dashboard/Dashboard';
import DietLog from './components/diet/DietLog';
import Analytics from './components/analytics/Analytics';
import GoalSetting from './components/goal/GoalSetting';
import Recommendations from './components/common/Recommendations';
import Settings from './components/settings/Settings';

function App() {
  const renderContent = (activeTab: TabType) => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />;
      case 'log':
        return <DietLog />;
      case 'analytics':
        return <Analytics />;
      case 'goal':
        return <GoalSetting />;
      case 'recommendation':
        return <Recommendations />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return <Layout>{renderContent}</Layout>;
}

export default App;
