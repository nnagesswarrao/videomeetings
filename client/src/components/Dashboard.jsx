import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Video Meeting</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/create-meeting"
                className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
              >
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                  Create Meeting
                </h5>
                <p className="font-normal text-gray-700">
                  Schedule a new meeting and invite participants
                </p>
              </Link>

              <Link
                to="/join-meeting"
                className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
              >
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                  Join Meeting
                </h5>
                <p className="font-normal text-gray-700">
                  Join an existing meeting with a meeting code
                </p>
              </Link>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Meetings</h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {/* This will be populated with actual meeting data */}
                  <li className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-600">Daily Standup</p>
                        <p className="text-sm text-gray-500">Today at 10:00 AM</p>
                      </div>
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm">
                        Join
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
