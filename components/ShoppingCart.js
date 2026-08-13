'use client';
import {useState} from 'react';
import {useCart} from './CartContext';
import {money,whatsappUrl} from '@/data/settings';

const DELIVERY_FEE=120;
const FREE_DELIVERY_MINIMUM=2000;

export default function ShoppingCart(){
  const {items,open,setOpen,change,remove}=useCart();
  const [paying,setPaying]=useState(false);
  const [paymentError,setPaymentError]=useState('');
  const [deliveryMethod,setDeliveryMethod]=useState('delivery');
  const subtotal=items.reduce((sum,item)=>sum+(item.salePrice||item.price)*item.qty,0);
  const qualifiesForFreeDelivery=subtotal>=FREE_DELIVERY_MINIMUM;
  const deliveryFee=deliveryMethod==='collection'||qualifiesForFreeDelivery?0:DELIVERY_FEE;
  const total=subtotal+deliveryFee;
  const deliveryLabel=deliveryMethod==='collection'?'Collection':qualifiesForFreeDelivery?'Free delivery':'Standard delivery';

  const whatsappCheckout=()=>{
    const lines=items.map(item=>`${item.qty} x ${item.name} – ${money(item.salePrice||item.price)}${item.qty>1?' each':''}`).join('\n');
    window.open(whatsappUrl(`Hi Sentique Perfumes. I would like to order:\n\n${lines}\n\nSubtotal: ${money(subtotal)}\n${deliveryLabel}: ${money(deliveryFee)}\nTotal: ${money(total)}\n\nPlease confirm availability and ${deliveryMethod==='collection'?'collection arrangements':'delivery'}.`),'_blank');
  };

  const yocoCheckout=async()=>{
    setPaying(true);
    setPaymentError('');
    try{
      const response=await fetch('/api/yoco/checkout',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          items:items.map(item=>({id:item.id,qty:item.qty})),
          deliveryMethod
        })
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
        <fieldset className="delivery-options">
          <legend>Delivery method</legend>
          <label className={deliveryMethod==='delivery'?'selected':''}>
            <input type="radio" name="delivery" value="delivery" checked={deliveryMethod==='delivery'} onChange={()=>setDeliveryMethod('delivery')}/>
            <span><b>{qualifiesForFreeDelivery?'Free delivery':'Standard delivery'}</b><small>{qualifiesForFreeDelivery?'Your order qualifies for free delivery.':`${money(DELIVERY_FEE)} · Free from ${money(FREE_DELIVERY_MINIMUM)}`}</small></span>
            <strong>{money(qualifiesForFreeDelivery?0:DELIVERY_FEE)}</strong>
          </label>
          <label className={deliveryMethod==='collection'?'selected':''}>
            <input type="radio" name="delivery" value="collection" checked={deliveryMethod==='collection'} onChange={()=>setDeliveryMethod('collection')}/>
            <span><b>Collection</b><small>Arrange collection with Sentique Perfumes.</small></span>
            <strong>{money(0)}</strong>
          </label>
        </fieldset>
        <div className="totals">
          <span>Subtotal</span><b>{money(subtotal)}</b>
          <span>{deliveryLabel}</span><b>{money(deliveryFee)}</b>
          <span className="grand-total">Total</span><b className="grand-total">{money(total)}</b>
        </div>
        <button className="button wide" onClick={yocoCheckout} disabled={paying}>{paying?'Opening secure payment…':'Pay securely with Yoco'}</button>
        {paymentError&&<p className="payment-error">{paymentError}</p>}
        <button className="button whatsapp wide" onClick={whatsappCheckout}>Order via WhatsApp</button>
      </>}
    </aside>
  </>;
}
