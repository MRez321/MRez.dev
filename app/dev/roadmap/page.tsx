import ProjectRoadmap from '@/components/ProjectRoadmap';
import Link from 'next/link';

export default function RoadMap() {
  return (
    <>
    <div>
    <Link href='/'>Home</Link>

      <ProjectRoadmap />
    </div>
    </>
  )
}