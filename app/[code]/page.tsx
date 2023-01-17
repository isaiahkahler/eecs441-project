"use client";
import { usePathname } from 'next/navigation'

export default function ClassClient() {
  const pathname = usePathname() || '/';
  const code = pathname.substr(1);
  return (
    <>
      class client!
      the code is {code}
    </>
  );
}