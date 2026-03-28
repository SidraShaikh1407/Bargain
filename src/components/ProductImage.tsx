import React, { useState } from 'react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  productId: number | string;
  size?: 'small' | 'medium' | 'large';
}

export const ProductImage: React.FC<ProductImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  productId,
  size = 'medium'
}) => {
  const [error, setError] = useState(false);
  
  const dimensions = {
    small: '200/200',
    medium: '400/400',
    large: '800/800'
  }[size];

  const fallbackUrl = `https://picsum.photos/seed/${productId}/${dimensions}`;

  return (
    <img
      src={error || !src ? fallbackUrl : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
    />
  );
};
