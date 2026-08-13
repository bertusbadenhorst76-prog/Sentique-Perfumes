'use client';
import Link from 'next/link';
import {useEffect} from 'react';
import {useCart} from '@/components/CartContext';

export default function PaymentSuccess(){
  const {clear}=useCart();
  useEffect(()=>{clear()},[]);
  return <main className="prose">
    <p className="eyebrow">Payment submitted</p>
    <h1>Thank you for your order</h1>
    <p>Your Yoco payment was submitted successfully. Sentique Perfumes will confirm your order and delivery details.</p>
    <Link className="button" href="/shop">Continue shopping</Link>
  </main>;
}
