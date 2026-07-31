import Image from 'next/image';

import Logo from '@/assets/pixelstarai - Copy.jpg'

export default function GlobalNavigation() {
  return (
    <>
      <nav className="flex items-center justify-between flex-row w-full ">
        <ul className="flex items-center justify-between flex-row w-full ">
          <li>
            <Image src={Logo} alt='pixel star' className='w-8 h-8' />
          </li>
          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>4</li>
          <li>5</li>
        </ul>

        </nav>


    </>
  );
}
