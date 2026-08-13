'use client';
import {useState} from 'react';
import {useCart} from './CartContext';
import {money,whatsappUrl} from '@/data/settings';

export default function ShoppingCart(){
  const {items,open,setOpen,change,remove}=useCart();
  const [paying,setPaying]=useState(false);
  const [paymentError,setPaymentError]=useState('');
  const total=items.reduce((sum,item)=>sum+(item.salePrice||item.price)*item.qty,0);

  const whatsappCheckout=()=>{
    const lines=items.map(item=>`${item.qty} x ${item.name} – ${money(item.salePrice||item.price)}${item.qty>1?' each':''}`).join('\n');
    window.open(whatsappUrl(`Hi Sentique Perfumes. I would like to order:\n\n${lines}\n\nTotal: ${money(total)}\n\nPlease confirm availability and delivery.`),'_blank');
  };

  const yocoCheckout=async()=>{
    setPaying(true);
    setPaymentError('');
    try{
      const response=await fetch('/api/yoco/checkout',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({items:items.map(item=>({id:item.id,qty:item.qty}))})
      });
      const result=await response.json();
      if(!response.ok||!result.redirectUrl) throw new Error(result.error||'Unable to start payment.');
      window.location.assign(result.redirectUrl);
    }catch(error){
      setPaymentError(error.message);
      setPaying(false);
    }
  };

  return <>
    <div className={open?'scrim show':'scrim'} onClick={()=>setOpen(false)}/>
    <aside className={open?'cart open':'cart'} aria-label="Shopping cart">
      <div className="cart-head"><h2>Your bag</h2><button onClick={()=>setOpen(false)}>×</button></div>
      {!items.length?<div className="empty"><b>Your bag is waiting</b><p>Discover a fragrance that feels like you.</p></div>:<>
        {items.map(item=><div className="cart-item" key={item.id}>
          <img src={item.image} alt=""/>
          <div><b>{item.name}</b><small>{item.size}</small><div className="qty"><button onClick={()=>change(item.id,-1)}>−</button><span>{item.qty}</span><button onClick={()=>change(item.id,1)}>+</button></div></div>
          <div><b>{money((item.salePrice||item.price)*item.qty)}</b><button className="remove" onClick={()=>remove(item.id)}>Remove</button></div>
        </div>)}
        <div className="totals"><span>Subtotal</span><b>{money(total)}</b><span>Total</span><b>{money(total)}</b></div>
        <button className="button wide" onClick={yocoCheckout} disabled={paying}>{paying?'Opening secure payment…':'Pay securely with Yoco'}</button>
        {paymentError&&<p className="payment-error">{paymentError}</p>}
        <button className="button whatsapp wide" onClick={whatsappCheckout}>Order via WhatsApp</button>
      </>}
    </aside>
  </>;
}
