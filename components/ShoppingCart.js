'use client';
import {useState} from 'react';
import {useCart} from './CartContext';
import {money,whatsappUrl} from '@/data/settings';

const DELIVERY_FEE=120;
const FREE_DELIVERY_MINIMUM=2000;
const PROMOTION_CODE='SENTIQUE10';
const PROMOTION_PERCENT=10;

export default function ShoppingCart(){
  const {items,open,setOpen,change,remove}=useCart();
  const [paying,setPaying]=useState(false);
  const [paymentError,setPaymentError]=useState('');
  const [deliveryMethod,setDeliveryMethod]=useState('delivery');
  const [promoInput,setPromoInput]=useState('');
  const [promoCode,setPromoCode]=useState('');
  const [promoMessage,setPromoMessage]=useState('');
  const subtotal=items.reduce((sum,item)=>sum+(item.salePrice||item.price)*item.qty,0);
  const qualifiesForFreeDelivery=subtotal>=FREE_DELIVERY_MINIMUM;
  const deliveryFee=deliveryMethod==='collection'||qualifiesForFreeDelivery?0:DELIVERY_FEE;
  const discount=promoCode===PROMOTION_CODE?Math.round(subtotal*PROMOTION_PERCENT)/100:0;
  const total=Math.max(0,subtotal-discount+deliveryFee);
  const deliveryLabel=deliveryMethod==='collection'?'Collection':qualifiesForFreeDelivery?'Free delivery':'Standard delivery';

  const applyPromotion=(event)=>{
    event.preventDefault();
    const code=promoInput.trim().toUpperCase();
    if(code===PROMOTION_CODE){
      setPromoCode(PROMOTION_CODE);
      setPromoInput(PROMOTION_CODE);
      setPromoMessage(`${PROMOTION_PERCENT}% discount applied.`);
    }else{
      setPromoCode('');
      setPromoMessage('This promotion code is not valid.');
    }
  };

  const removePromotion=()=>{
    setPromoCode('');
    setPromoInput('');
    setPromoMessage('');
  };

  const whatsappCheckout=()=>{
    const lines=items.map(item=>`${item.qty} x ${item.name} – ${money(item.salePrice||item.price)}${item.qty>1?' each':''}`).join('\n');
    const promotionLine=promoCode?`\nPromotion (${promoCode}): -${money(discount)}`:'';
    window.open(whatsappUrl(`Hi Sentique Perfumes. I would like to order:\n\n${lines}\n\nSubtotal: ${money(subtotal)}${promotionLine}\n${deliveryLabel}: ${money(deliveryFee)}\nTotal: ${money(total)}\n\nPlease confirm availability and ${deliveryMethod==='collection'?'collection arrangements':'delivery'}.`),'_blank');
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
          deliveryMethod,
          promotionCode:promoCode
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
        <section className="promotion">
          <b>Promotion code</b>
          <form onSubmit={applyPromotion}>
            <input type="text" value={promoInput} onChange={event=>setPromoInput(event.target.value.toUpperCase())} placeholder="Enter discount code" aria-label="Promotion code"/>
            <button type="submit">{promoCode?'Applied':'Apply'}</button>
          </form>
          {promoMessage&&<small className={promoCode?'promo-success':'promo-error'}>{promoMessage}</small>}
          {promoCode&&<button className="promo-remove" type="button" onClick={removePromotion}>Remove code</button>}
        </section>
        <div className="totals">
          <span>Subtotal</span><b>{money(subtotal)}</b>
          {promoCode&&<><span>Promotion ({promoCode})</span><b>−{money(discount)}</b></>}
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
