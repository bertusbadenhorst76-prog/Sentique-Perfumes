'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useCart} from './CartContext';
import CartDrawer from './ShoppingCart';

const links=[
  ['Home','/'],
  ['Shop','/shop'],
  ['Women','/shop?category=Women'],
  ['Men','/shop?category=Men'],
  ['Unisex','/shop?category=Unisex'],
  ['New Arrivals','/shop?special=new'],
  ['Best Sellers','/shop?special=best'],
  ['About Us','/#about'],
  ['Contact','/contact']
];

export default function Header(){
  const {items,setOpen}=useCart();
  return <>
    <header className="header">
      <Link className="brand-logo header-logo" href="/" aria-label="Sentique Perfumes home">
        <Image src="/images/logo/1000266587.jpg" alt="Sentique Perfumes" width={1254} height={1254} priority sizes="(max-width: 700px) 98px, 132px"/>
      </Link>
      <nav className="nav header-nav" aria-label="Main navigation">
        {links.map(([name,href])=><Link key={name} href={href}>{name}</Link>)}
      </nav>
      <div className="header-actions">
        <Link href="/shop" aria-label="Search">⌕</Link>
        <button onClick={()=>setOpen(true)} aria-label="Shopping bag">♧<i>{items.reduce((total,item)=>total+item.qty,0)}</i></button>
      </div>
    </header>
    <CartDrawer/>
  </>;
}
