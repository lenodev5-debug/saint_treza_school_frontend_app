import ProfileAvatar from "./ProfileAvatar";
import StatusBadge from "./StatusBadge";
import ProfileActions from "./ProfileActions";

export default function UserProfileRow({
  profile,
  selected = false,
  onSelect,
  onView,
  onEdit,
  onDeleted,
  onStatusChanged,
}) {
  if (!profile || (!profile._id && !profile.id)) return null;

  const id = profile._id || profile.id;

  // Nested userId OR flat
  const user = profile.userId ?? profile;
  const role = user.role ?? profile.role ?? "User";
  const status = profile.status ?? user.status ?? "inactive";

  const username =
    user.username ||
    (user.email ? user.email.split("@")[0] : "user");

  return (
    <tr
      onClick={() => onView?.(profile)}
      className={`group cursor-pointer border-b border-gray-100 text-[13px] transition dark:border-[#2a2a2a] ${
        selected
          ? "bg-[#f0fdfa] dark:bg-[#0f2b28]"
          : "bg-white hover:bg-[#fafafa] dark:bg-[#1A1A1A] dark:hover:bg-[#212121]"
      }`}
    >
      <td className="w-10 pl-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect?.(id, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="h-3.5 w-3.5 rounded border-gray-300 text-[#14b8a6] focus:ring-[#14b8a6] dark:border-[#3a3a3a] dark:bg-[#1f1f1f]"
        />
      </td>

      <td className="py-2 pr-4">
        <div className="flex items-center gap-2.5">
          <ProfileAvatar user={profile} size={28} />
          <span className="text-gray-700 dark:text-gray-200">
            {username}
          </span>
        </div>
      </td>

      <td className="py-2 pr-4 text-gray-700 dark:text-gray-200">
        {user.name ?? "—"}
      </td>

      <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">
        {user.email ?? "—"}
      </td>

      <td className="py-2 pr-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 items-center rounded bg-[#eefafa] px-2 text-xs font-medium text-[#0f2424] dark:bg-[#0f2424] dark:text-[#7adcdc]">
            {role}
          </span>
          <StatusBadge status={status} />
        </div>
      </td>

      <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">
        {user.phone ?? "—"}
      </td>

      <td className="py-2 pr-4">
        <ProfileActions
          profile={{ ...profile, role }}
          onEdit={onEdit}
          onDeleted={onDeleted}
          onStatusChanged={onStatusChanged}
        />
      </td>
    </tr>
  );
}