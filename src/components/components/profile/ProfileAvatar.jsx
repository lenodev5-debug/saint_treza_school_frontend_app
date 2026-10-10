export default function ProfileAvatar({ user, size = 28 }) {
  // Support both flat user and nested profile.userId
  const person = user?.userId ?? user;

  const initials =
    person?.name
      ?.split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    person?.email?.[0]?.toUpperCase() ||
    "U";

  const image = person?.image ?? person?.avatar;

  if (image) {
    return (
      <img
        src={image}
        alt={person?.name ?? person?.email ?? "avatar"}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-[#14b8a6]/15 font-semibold text-[#0f766e] dark:bg-[#14b8a6]/20 dark:text-[#5eead4]"
      style={{ width: size, height: size, fontSize: size / 2.4 }}
    >
      {initials}
    </div>
  );
}