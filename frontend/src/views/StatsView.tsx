import React from 'react';
import { useParams } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { usePlayerStats } from '../hooks/usePlayerStats';
import LoadingSpinner from '../components/atoms/LoadingSpinner';
import StatsOverviewPanel from '../components/organisms/StatsOverviewPanel';
import EloSection from '../components/organisms/EloSection';
import CombatSection from '../components/organisms/CombatSection';
import WeaponSection from '../components/organisms/WeaponSection';

/**
 * Stats page view mounted at /stats and /stats/:userId.
 *
 * userId resolution order:
 *   1. `:userId` URL param (when browsing another player's profile)
 *   2. Authenticated user's own profile.id (from useUserProfile)
 *
 * usePlayerStats receives 0 while the profile is still loading, which
 * causes the hook to skip all fetches until a valid id is available.
 */
const StatsView: React.FC = () => {
  const { userId: userIdParam } = useParams<{ userId?: string }>();
  const { profile, loading: profileLoading } = useUserProfile();

  const resolvedUserId: number = userIdParam ? parseInt(userIdParam, 10) : (profile?.id ?? 0);

  const {
    summary,
    summaryLoading,
    summaryError,
    eloHistory,
    eloHistoryLoading,
    eloHistoryError,
    topWeapons,
    topWeaponsLoading,
    topWeaponsError,
    eloFilters,
    setEloFilters,
  } = usePlayerStats(resolvedUserId);

  // Only block the full page when we don't have a userId yet from either source
  if (profileLoading && !userIdParam) {
    return <LoadingSpinner label="Resolving Profile..." />;
  }

  const isViewingOwnProfile = !userIdParam;

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white">
            {isViewingOwnProfile ? 'My Stats' : 'Player Stats'}
          </h1>
          {!isViewingOwnProfile && (
            <p className="mt-1 font-mono text-xs text-gray-500">User ID: {userIdParam}</p>
          )}
        </div>
        {summary?.favoriteWeaponName && (
          <div className="hidden text-right sm:block">
            <p className="text-[10px] uppercase tracking-widest text-gray-600">Favourite Weapon</p>
            <p className="text-sm font-bold text-gray-300">{summary.favoriteWeaponName}</p>
          </div>
        )}
      </header>

      <StatsOverviewPanel summary={summary} loading={summaryLoading} error={summaryError} />

      <EloSection
        data={eloHistory}
        loading={eloHistoryLoading}
        error={eloHistoryError}
        filters={eloFilters}
        onFiltersChange={setEloFilters}
      />

      <CombatSection summary={summary} loading={summaryLoading} error={summaryError} />

      <WeaponSection weapons={topWeapons} loading={topWeaponsLoading} error={topWeaponsError} />
    </div>
  );
};

export default StatsView;
