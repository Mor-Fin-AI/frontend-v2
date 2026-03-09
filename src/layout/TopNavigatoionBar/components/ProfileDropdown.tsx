import Image from "next/image";

export default function ProfileDropdown() {
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      {/* Gradient Border */}
      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#A855F7] to-[#22D3EE] p-[2px]">
        {/* Image */}
        <div className="relative h-full w-full rounded-full overflow-hidden">
          <Image
            src="/header/profile-img.png" // your image path
            alt="Profile"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* <span className="text-sm font-medium text-white">Admin</span> */}
    </div>
  );
}
