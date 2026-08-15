import {NextResponse} from 'next/server';
import {products} from '@/data/products';

export const runtime='nodejs';

const DELIVERY_FEE=120;
const FREE_DELIVERY_MINIMUM=2000;
const PROMOTION_CODE='SENTIQUE10';
const PROMOTION_PERCENT=10;

export async function POST(request){
  try{
    if(!process.env.YOCO_SECRET_KEY){
      return NextResponse.json({error:'Yoco payments are not connected yet.'},{status:503});
    }

    const body=await request.json();
    const requested=Array.isArray(body.items)?body.items:[];
    const deliveryMethod=body.deliveryMethod==='collection'?'collection':'delivery';
    const requestedPromotion=String(body.promotionCode||'').trim().toUpperCase();
    const sourceCustomer=body.customer&&typeof body.customer==='object'?body.customer:{};
    const clean=(value,max=160)=>String(value||'').trim().slice(0,max);
    const customer={
      fullName:clean(sourceCustomer.fullName),
      email:clean(sourceCustomer.email),
      telephone:clean(sourceCustomer.telephone,40),
      addressLine1:clean(sourceCustomer.addressLine1),
      suburb:clean(sourceCustomer.suburb,80),
      city:clean(sourceCustomer.city,80),
      province:clean(sourceCustomer.province,80),
      postalCode:clean(sourceCustomer.postalCode,20)
    };
    if(!requested.length){
      return NextResponse.json({error:'Your cart is empty.'},{status:400});
    }
    if(!customer.fullName||!customer.email||!customer.telephone){
      return NextResponse.json({error:'Please enter your full name, email address and telephone number.'},{status:400});
    }
    if(!/^\S+@\S+\.\S+$/.test(customer.email)){
      return NextResponse.json({error:'Please enter a valid email address.'},{status:400});
    }
    if(deliveryMethod==='delivery'&&(!customer.addressLine1||!customer.suburb||!customer.city||!customer.province||!customer.postalCode)){
      return NextResponse.json({error:'Please complete your delivery address.'},{status:400});
    }

    const orderItems=requested.map(({id,qty})=>{
      const product=products.find(item=>item.id===String(id));
      const quantity=Number(qty);
      if(!product||!product.stock||!Number.isInteger(quantity)||quantity<1||quantity>20){
        throw new Error('One or more cart items are invalid.');
      }
      const unitPrice=product.salePrice||product.price;
      return {id:product.id,name:product.name,quantity,unitPrice};
    });

    const subtotal=orderItems.reduce((sum,item)=>sum+item.unitPrice*item.quantity,0);
    if(requestedPromotion&&requestedPromotion!==PROMOTION_CODE){
      return NextResponse.json({error:'This promotion code is not valid.'},{status:400});
    }
    const promotionCode=requestedPromotion===PROMOTION_CODE?PROMOTION_CODE:'';
    const discount=promotionCode?Math.round(subtotal*PROMOTION_PERCENT)/100:0;
    const qualifiesForFreeDelivery=subtotal>=FREE_DELIVERY_MINIMUM;
    const deliveryFee=deliveryMethod==='collection'||qualifiesForFreeDelivery?0:DELIVERY_FEE;
    const deliveryLabel=deliveryMethod==='collection'?'Collection':qualifiesForFreeDelivery?'Free delivery':'Standard delivery';
    const deliveryAddress=deliveryMethod==='delivery'?[customer.addressLine1,customer.suburb,customer.city,customer.province,customer.postalCode].join(', '):'Collection';
    const amount=Math.round((subtotal-discount+deliveryFee)*100);
    const orderId=crypto.randomUUID();
    const origin=new URL(request.url).origin;
    const response=await fetch('https://payments.yoco.com/api/checkouts',{
      method:'POST',
      headers:{
        Authorization:`Bearer ${process.env.YOCO_SECRET_KEY}`,
        'Content-Type':'application/json',
        'Idempotency-Key':orderId
      },
      body:JSON.stringify({
        amount,
        currency:'ZAR',
        successUrl:`${origin}/checkout/success?order=${orderId}`,
        cancelUrl:`${origin}/shop?payment=cancelled`,
        failureUrl:`${origin}/shop?payment=failed`,
        metadata:{
          orderId,
          customerName:customer.fullName,
          customerEmail:customer.email,
          customerTelephone:customer.telephone,
          deliveryAddress:deliveryAddress.slice(0,500),
          items:orderItems.map(item=>`${item.quantity}x ${item.name}`).join(', ').slice(0,500),
          deliveryMethod,
          deliveryLabel,
          deliveryFee:String(deliveryFee),
          promotionCode,
          discount:String(discount)
        }
      }),
      cache:'no-store'
    });

    const checkout=await response.json();
    if(!response.ok||!checkout.redirectUrl){
      console.error('Yoco checkout error',checkout);
      return NextResponse.json({error:'Yoco could not start the payment. Please try again.'},{status:502});
    }

    return NextResponse.json({redirectUrl:checkout.redirectUrl});
  }catch(error){
    return NextResponse.json({error:error.message||'Unable to start payment.'},{status:400});
  }
}
