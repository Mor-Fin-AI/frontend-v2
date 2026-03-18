import Image from "next/image";
import { useUser } from "@/context/UserContext";

export default function ProfileDropdown() {
  const { user } = useUser();

  return (
    <div className="flex items-center gap-3 cursor-pointer">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-semibold text-white leading-none">{user.name}</p>
        <p className="text-[10px] font-medium text-zinc-400 mt-1">{user.role}</p>
      </div>
      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#A855F7] to-[#22D3EE] p-[2px]">

        <div className="relative h-full w-full rounded-full overflow-hidden">
          <Image
            src="/header/profile-img.png"
            alt="Profile"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
