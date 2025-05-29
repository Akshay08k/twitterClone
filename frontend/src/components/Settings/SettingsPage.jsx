import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import SettingsSidebar from "./SettingsSidebar";
import PrivacySettings from "./PrivacySettings";
import NotificationSettings from "./NotificationSettings";
import AccountSettings from "./AccountSettings";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [showSidebar, setShowSidebar] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "privacy":
        return <PrivacySettings />;
      case "notifications":
        return <NotificationSettings />;
      case "account":
        return <AccountSettings />;
      default:
        return <AccountSettings />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "privacy":
        return "Privacy & Safety";
      case "notifications":
        return "Notifications";
      case "account":
        return "Account Settings";
      default:
        return "Settings";
    }
  };

  return (
    <div className="min-h-screen bg-black mt-16">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-white hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-white">{getTabTitle()}</h1>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="w-80 h-full bg-gray-900 border-r border-gray-800">
              <div className="p-4 border-b border-gray-800">
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
              </div>
              <SettingsSidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setShowSidebar(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">{renderActiveTab()}</div>
      </div>
    </div>
  );
};

export default SettingsPage;
