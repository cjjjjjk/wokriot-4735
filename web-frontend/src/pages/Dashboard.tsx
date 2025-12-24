import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/dashboard/Header';
import GeneralTab from '../components/dashboard/GeneralTab';
import ProfileTab from '../components/dashboard/ProfileTab';
import ManagerTab from '../components/dashboard/ManagerTab';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('general');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralTab />;
            case 'profile':
                return <ProfileTab />;
            case 'manager':
                return user?.is_admin ? <ManagerTab /> : null;
            default:
                return <GeneralTab />;
        }
    };

    return (
        <div className="dashboard">
            <Header activeTab={activeTab} onTabChange={setActiveTab} />
            <main className="dashboard-content">
                {renderTabContent()}
            </main>
        </div>
    );
};

export default Dashboard;
