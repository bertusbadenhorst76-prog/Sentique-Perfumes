// SAFE TO EDIT: Update your contact details and social links here.
export const settings={
  whatsappNumber:'27XXXXXXXXX',
  telephone:'+27 00 000 0000',
  email:'hello@sentiqueperfumes.co.za',
  instagram:'https://instagram.com/',
  tiktok:'https://tiktok.com/',
  hours:'Monday–Friday, 09:00–17:00 · Saturday, 09:00–13:00'
};

export const money=(amount)=>`R${Number(amount).toLocaleString('en-ZA')}`;
export const whatsappUrl=(message)=>`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
