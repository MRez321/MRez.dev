import Image from "next/image";

import Link from 'next/link';

export default function Home() {
  return (
    // <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
    //   <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
    //     <Image
    //       className="dark:invert"
    //       src="/next.svg"
    //       alt="Next.js logo"
    //       width={100}
    //       height={20}
    //       priority
    //     />
    //   </main>
    // </div>

    <section>
      <h1>MRez Next</h1>
      <ul className='flex flex-col flex-1 items-center justify-center gap-2'>
        <li className='bg-emerald-300 hover:bg-emerald-600 p-2 rounded-2xl'>
          <Link href="/dev/checklist" className=''>ProjectChecklist</Link>
        </li>
        <li className='bg-emerald-300 hover:bg-emerald-600 p-2 rounded-2xl'>
          <Link href="/dev/roadmap">ProjectRoadmap</Link>
        </li>

      </ul>

    </section>
  );
}
