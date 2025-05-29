import React from "react";
import { User, Lock, Bell, Settings as SettingsIcon } from "lucide-react";

const SettingsSidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "privacy", label: "Privacy & Safety", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account", icon: SettingsIcon },
  ];

  return (
    <div className="w-80 bg-black-900  border-gray-800 min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default SettingsSidebar;
