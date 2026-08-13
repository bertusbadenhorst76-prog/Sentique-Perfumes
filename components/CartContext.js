'use client';
import {createContext,useContext,useEffect,useState} from 'react';
const CartContext=createContext();
export function CartProvider({children}){const [items,setItems]=useState([]);const [open,setOpen]=useState(false);useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem('sentique-cart'))||[])}catch{}},[]);useEffect(()=>{localStorage.setItem('sentique-cart',JSON.stringify(items))},[items]);const add=(product,qty=1)=>{setItems(x=>{const hit=x.find(i=>i.id===product.id);return hit?x.map(i=>i.id===product.id?{...i,qty:i.qty+qty}:i):[...x,{...product,qty}]});setOpen(true)};const change=(id,delta)=>setItems(x=>x.map(i=>i.id===id?{...i,qty:i.qty+delta}:i).filter(i=>i.qty>0));const remove=id=>setItems(x=>x.filter(i=>i.id!==id));const clear=()=>setItems([]);return <CartContext.Provider value={{items,open,setOpen,add,change,remove,clear}}>{children}</CartContext.Provider>}
export const useCart=()=>useContext(CartContext);
