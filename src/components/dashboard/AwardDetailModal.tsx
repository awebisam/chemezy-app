import React from 'react';
import { Modal } from '@/components/ui/Modal';
import type { UserAward, AwardCategory } from '@/types/award.types';

interface AwardDetailModalProps {
  award: UserAward;
  isOpen: boolean;
  onClose: () => void;
}

export const AwardDetailModal: React.FC<AwardDetailModalProps> = ({
  award,
  isOpen,
  onClose,
}) => {
  const getCategoryColor = (category: AwardCategory) => {
    const colors = {
      discovery: 'bg-blue-100 text-blue-800 border-blue-200',
      database_contribution: 'bg-green-100 text-green-800 border-green-200',
      community: 'bg-purple-100 text-purple-800 border-purple-200',
      special: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      achievement: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTierInfo = (tier: number) => {
    if (tier >= 3) {
      return {
        name: 'Gold',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: (
          <svg
            className="w-6 h-6 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ),
      };
    } else if (tier >= 2) {
      return {
        name: 'Silver',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        icon: (
          <svg
            className="w-6 h-6 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ),
      };
    } else {
      return {
        name: 'Bronze',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: (
          <svg
            className="w-6 h-6 text-orange-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ),
      };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatProgressValue = (_key: string, value: any): string => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    if (typeof value === 'boolean') {
      return value ? 'Complete' : 'Incomplete';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  };

  const getProgressLabel = (key: string): string => {
    const labels: Record<string, string> = {
      reactions_count: 'Total Reactions',
      discoveries_count: 'Unique Discoveries',
      chemicals_used: 'Chemicals Used',
      experiments_completed: 'Experiments Completed',
      days_active: 'Days Active',
      points_earned: 'Points Earned',
      awards_earned: 'Awards Earned',
      first_discovery: 'First Discovery',
      reaction_types: 'Reaction Types',
      environment_types: 'Environment Types Used',
    };
    return (
      labels[key] ||
      key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  const tierInfo = getTierInfo(award.tier);
  const points = award.tier * 10;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Award Details" size="lg">
      <div className="space-y-6">
        {/* Award Header */}
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${tierInfo.bgColor} mb-4`}
          >
            {tierInfo.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {award.template.name}
          </h2>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(award.template.category)}`}
            >
              {award.template.category.replace('_', ' ')}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${tierInfo.color} ${tierInfo.bgColor}`}
            >
              {tierInfo.name} Tier
            </span>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed">
            {award.template.description}
          </p>
        </div>

        {/* Award Stats */}
        <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              Tier {award.tier}
            </div>
            <div className="text-sm text-gray-600">Achievement Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-600">
              {points}
            </div>
            <div className="text-sm text-gray-600">Points Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              #{award.id}
            </div>
            <div className="text-sm text-gray-600">Award ID</div>
          </div>
        </div>

        {/* Earning Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Earning Details
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Earned on {formatDate(award.granted_at)}
            </div>
            {award.related_entity_type && award.related_entity_id && (
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Related to {award.related_entity_type} #
                {award.related_entity_id}
              </div>
            )}
          </div>
        </div>

        {/* Progress Information */}
        {award.progress && Object.keys(award.progress).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Achievement Progress
            </h3>
            <div className="space-y-3">
              {Object.entries(award.progress).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {getProgressLabel(key)}
                  </span>
                  <span className="text-sm text-gray-900 font-semibold">
                    {formatProgressValue(key, value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Information */}
        {award.template.metadata &&
          Object.keys(award.template.metadata).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Award Criteria
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-2">
                  {Object.entries(award.template.metadata).map(
                    ([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium text-blue-900">
                          {getProgressLabel(key)}:
                        </span>
                        <span className="ml-2 text-blue-700">
                          {formatProgressValue(key, value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Congratulations Message */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <svg
              className="w-8 h-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Congratulations!
          </h4>
          <p className="text-gray-700">
            You've earned this {tierInfo.name.toLowerCase()} tier award through
            your dedication to chemistry exploration. Keep experimenting to
            unlock more achievements!
          </p>
        </div>
      </div>
    </Modal>
  );
};
