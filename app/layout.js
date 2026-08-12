import './globals.css';
import { CartProvider } from '@/components/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata={title:{default:'Sentique Perfumes | Find Your Signature Scent',template:'%s | Sentique Perfumes'},description:'Discover authentic, carefully selected luxury fragrances for women and men. Shop Sentique Perfumes with easy WhatsApp ordering across South Africa.'};

export default function RootLayout({children}){return <html lang="en"><body><CartProvider><Header/><main>{children}</main><Footer/><WhatsAppButton/></CartProvider></body></html>}
