import { useMemo, useState } from "react";
import { useProfiles } from "../../../hooks/useProfiles";
import UserProfileRow from "./UserProfileRow";
import UserProfileDetail from "./UserProfileDetail";
import {
  faColumns,
  faEye,
  faGauge,
  faTableList,
  faUser,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const isValidProfile = (p) => p && (p._id || p.id);

export default function ProfileList({
  role,
  params,
  onEdit,
  onView,
  onDeleted,
  onStatusChanged,
  profilesOverride,
  loadingOverride,
}) {
  const { profiles, loading, error, refetch } = useProfiles({ role, params });

  const [local, setLocal] = useState(null);
  const [selected, setSelected] = useState([]);
  const [openProfile, setOpenProfile] = useState(null); // detail view state

  const rawList = profilesOverride ?? local ?? profiles;
  const list = rawList.filter(isValidProfile);
  const isLoading = loadingOverride ?? (loading && !list.length);

  const allSelected = useMemo(
    () => list.length > 0 && selected.length === list.length,
    [list, selected]
  );

  const handleSelectAll = (checked) => {
    setSelected(checked ? list.map((p) => p._id || p.id) : []);
  };

  const handleSelectOne = (id, checked) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const handleDeleted = (id) => {
    setLocal((prev) =>
      (prev ?? profiles).filter((x) => (x._id || x.id) !== id)
    );
    setOpenProfile(null); // close detail if it was open
    onDeleted?.(id);
  };

  const handleStatusChanged = (id, status) => {
    setLocal((prev) =>
      (prev ?? profiles).map((x) =>
        (x._id || x.id) === id ? { ...x, status } : x
      )
    );
    onStatusChanged?.(id, status);
  };

  // Row click → open detail
  const handleRowClick = (profile) => {
    onView?.(profile); // still bubble up if parent wants it
    setOpenProfile(profile); // and show inline detail
  };

  /* ---------- DETAIL VIEW ---------- */
  if (openProfile) {
    const id = openProfile._id || openProfile.id;
    const rowRole = openProfile.role ?? role;

    return (
      <div className="space-y-4">
        <button
          onClick={() => setOpenProfile(null)}
          className="inline-flex h-9 items-center gap-2 rounded border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-gray-200"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to list
        </button>

        <UserProfileDetail
          profileId={id}
          role={rowRole}
          onEdit={(p) => onEdit?.(p ?? openProfile)}
          onDeleted={handleDeleted}
          onStatusChanged={handleStatusChanged}
        />
      </div>
    );
  }

  /* ---------- loading ---------- */
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg bg-white shadow-sm dark:bg-[#1A1A1A]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-[#14b8a6] dark:border-[#2a2a2a]" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  /* ---------- error ---------- */
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
        {error}{" "}
        <button onClick={refetch} className="underline">
          Retry
        </button>
      </div>
    );
  }

  /* ---------- LIST VIEW ---------- */
  return (
    <div className="space-y-4">
      {/* top bar: Add Filter + chip */}
      <div className="flex flex-wrap items-center gap-3">
        <button className="inline-flex h-10 items-center gap-2 rounded bg-[#14b8a6] px-4 text-sm font-medium text-white transition hover:bg-[#0d9488]">
          <span className="text-base leading-none">≡</span>
          Add Filter
        </button>

        <div className="inline-flex h-10 items-center gap-2 rounded border border-gray-200 bg-white px-3 text-sm text-gray-700 dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-gray-200">
          <span>User Group</span>
          <span className="text-gray-400">is</span>
          <span className="font-medium">{role.toLowerCase()}</span>
          <button className="ml-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            ✕
          </button>
        </div>
      </div>

      {/* counter + view toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <FontAwesomeIcon icon={faUser} className="text-gray-500" />
          <span className="text-lg font-semibold">{list.length}</span>
          <span className="text-gray-400">/</span>
          <span className="text-lg font-semibold">{list.length}</span>
          <span className="text-sm text-gray-500">users</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex h-9 items-center gap-2 rounded border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-gray-200">
            <FontAwesomeIcon icon={faGauge} />
            <span className="text-xs">⌄</span>
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-gray-200">
            <FontAwesomeIcon icon={faColumns} />
          </button>
          <button className="flex h-9 items-center gap-2 rounded border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-gray-200">
            <FontAwesomeIcon icon={faEye} />
            <span className="text-xs">⌄</span>
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-gray-200">
            <FontAwesomeIcon icon={faTableList} />
          </button>
        </div>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-[#1A1A1A]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#2E3440] text-left text-[11px] font-medium uppercase tracking-wider text-[#e5e7eb] dark:bg-[#222222]">
                <th className="w-10 py-3 pl-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-gray-400 text-[#14b8a6] focus:ring-[#14b8a6]"
                  />
                </th>
                <th className="py-3 pr-4">Username</th>
                <th className="py-3 pr-4">Display Name</th>
                <th className="py-3 pr-4">E-mail</th>
                <th className="py-3 pr-4">User Role</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-sm text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                list.map((p) => {
                  const id = p._id || p.id;
                  return (
                    <UserProfileRow
                      key={id}
                      profile={p}
                      selected={selected.includes(id)}
                      onSelect={handleSelectOne}
                      onView={handleRowClick}
                      onEdit={onEdit}
                      onDeleted={handleDeleted}
                      onStatusChanged={handleStatusChanged}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}