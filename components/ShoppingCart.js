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
  const [customer,setCustomer]=useState({fullName:'',email:'',telephone:'',addressLine1:'',suburb:'',city:'',province:'',postalCode:''});
  const [customerError,setCustomerError]=useState('');
  const subtotal=items.reduce((sum,item)=>sum+(item.salePrice||item.price)*item.qty,0);
  const qualifiesForFreeDelivery=subtotal>=FREE_DELIVERY_MINIMUM;
  const deliveryFee=deliveryMethod==='collection'||qualifiesForFreeDelivery?0:DELIVERY_FEE;
  const discount=promoCode===PROMOTION_CODE?Math.round(subtotal*PROMOTION_PERCENT)/100:0;
  const total=Math.max(0,subtotal-discount+deliveryFee);
  const deliveryLabel=deliveryMethod==='collection'?'Collection':qualifiesForFreeDelivery?'Free delivery':'Standard delivery';

  const updateCustomer=(field,value)=>{
    setCustomer(current=>({...current,[field]:value}));
    setCustomerError('');
  };

  const validateCustomer=()=>{
    if(!customer.fullName.trim()||!customer.email.trim()||!customer.telephone.trim()) return 'Please enter your full name, email address and telephone number.';
    if(!/^\S+@\S+\.\S+$/.test(customer.email.trim())) return 'Please enter a valid email address.';
    if(deliveryMethod==='delivery'&&(!customer.addressLine1.trim()||!customer.suburb.trim()||!customer.city.trim()||!customer.province.trim()||!customer.postalCode.trim())) return 'Please complete your delivery address.';
    return '';
  };

  const customerDetails={...customer,fullName:customer.fullName.trim(),email:customer.email.trim(),telephone:customer.telephone.trim(),addressLine1:customer.addressLine1.trim(),suburb:customer.suburb.trim(),city:customer.city.trim(),province:customer.province.trim(),postalCode:customer.postalCode.trim()};

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
    const validationError=validateCustomer();
    if(validationError){setCustomerError(validationError);return;}
    const lines=items.map(item=>`${item.qty} x ${item.name} – ${money(item.salePrice||item.price)}${item.qty>1?' each':''}`).join('\n');
    const promotionLine=promoCode?`\nPromotion (${promoCode}): -${money(discount)}`:'';
    const addressLine=deliveryMethod==='delivery'?`\nDelivery address: ${customerDetails.addressLine1}, ${customerDetails.suburb}, ${customerDetails.city}, ${customerDetails.province}, ${customerDetails.postalCode}`:'\nDelivery method: Collection';
    window.open(whatsappUrl(`Hi Sentique Perfumes. I would like to order:\n\nCustomer: ${customerDetails.fullName}\nEmail: ${customerDetails.email}\nTelephone: ${customerDetails.telephone}${addressLine}\n\n${lines}\n\nSubtotal: ${money(subtotal)}${promotionLine}\n${deliveryLabel}: ${money(deliveryFee)}\nTotal: ${money(total)}\n\nPlease confirm availability and ${deliveryMethod==='collection'?'collection arrangements':'delivery'}.`),'_blank');
  };

  const yocoCheckout=async()=>{
    const validationError=validateCustomer();
    if(validationError){setCustomerError(validationError);return;}
    setPaying(true);
    setPaymentError('');
    try{
      const response=await fetch('/api/yoco/checkout',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          items:items.map(item=>({id:item.id,qty:item.qty})),
          deliveryMethod,
          promotionCode:promoCode,
          customer:customerDetails
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
        <section className="customer-details">
          <h3>Customer details</h3>
          <label>Full name<input type="text" autoComplete="name" value={customer.fullName} onChange={event=>updateCustomer('fullName',event.target.value)} required/></label>
          <div className="customer-grid">
            <label>Email<input type="email" autoComplete="email" value={customer.email} onChange={event=>updateCustomer('email',event.target.value)} required/></label>
            <label>Telephone<input type="tel" autoComplete="tel" value={customer.telephone} onChange={event=>updateCustomer('telephone',event.target.value)} required/></label>
          </div>
          {deliveryMethod==='delivery'&&<div className="address-fields">
            <h3>Delivery address</h3>
            <label>Street address<input type="text" autoComplete="street-address" value={customer.addressLine1} onChange={event=>updateCustomer('addressLine1',event.target.value)} required/></label>
            <div className="customer-grid">
              <label>Suburb<input type="text" autoComplete="address-level3" value={customer.suburb} onChange={event=>updateCustomer('suburb',event.target.value)} required/></label>
              <label>City<input type="text" autoComplete="address-level2" value={customer.city} onChange={event=>updateCustomer('city',event.target.value)} required/></label>
              <label>Province<input type="text" autoComplete="address-level1" value={customer.province} onChange={event=>updateCustomer('province',event.target.value)} required/></label>
              <label>Postal code<input type="text" inputMode="numeric" autoComplete="postal-code" value={customer.postalCode} onChange={event=>updateCustomer('postalCode',event.target.value)} required/></label>
            </div>
          </div>}
          {customerError&&<p className="customer-error">{customerError}</p>}
        </section>
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
        <button className="button ghost wide" type="button" onClick={()=>setOpen(false)}>Continue Shopping</button>
        <button className="button wide" onClick={yocoCheckout} disabled={paying}>{paying?'Opening secure payment…':'Pay securely with Yoco'}</button>
        {paymentError&&<p className="payment-error">{paymentError}</p>}
        <button className="button whatsapp wide" onClick={whatsappCheckout}>Order via WhatsApp</button>
      </>}
    </aside>
  </>;
}
