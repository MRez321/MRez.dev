import ProjectChecklist from '@/components/ProjectChecklist';
import Link from 'next/link';

export default function CheckList() {
  return (
    <>
      <div>
        <Link href='/'>Home</Link>

        <ProjectChecklist />
      </div>
    </>
  )
}