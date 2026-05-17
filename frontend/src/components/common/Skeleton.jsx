import React from 'react';


export const ProductCardSkeleton = () => {
  return (
    <div className="bg-[#f0ead2] border border-[#dde5b6] rounded-2xl overflow-hidden p-4 shadow-sm flex flex-col h-full animate-pulse">
      
      <div className="w-full aspect-square bg-[#dde5b6] rounded-xl mb-4"></div>
      
      
      <div className="h-4 w-20 bg-[#dde5b6] rounded-full mb-3"></div>
      
      
      <div className="h-6 w-3/4 bg-[#dde5b6] rounded-lg mb-2"></div>
      
      
      <div className="h-4 w-full bg-[#dde5b6] rounded-lg mb-4"></div>
      
      
      <div className="flex items-center gap-2 mb-5">
        <div className="h-5 w-16 bg-[#dde5b6] rounded-lg"></div>
        <div className="h-4 w-12 bg-[#dde5b6] rounded-lg"></div>
      </div>
      
      
      <div className="mt-auto grid grid-cols-2 gap-2 pt-2 border-t border-[#dde5b6]/40">
        <div className="h-10 bg-[#dde5b6] rounded-xl"></div>
        <div className="h-10 bg-[#dde5b6] rounded-xl"></div>
      </div>
    </div>
  );
};


export const ProductsGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};


export const ProductDetailSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 animate-pulse">
      
      <div className="aspect-square bg-[#dde5b6] rounded-2xl w-full"></div>
      
      
      <div className="flex flex-col justify-center py-4">
        <div className="h-5 w-24 bg-[#dde5b6] rounded-full mb-4"></div>
        <div className="h-10 w-2/3 bg-[#dde5b6] rounded-lg mb-4"></div>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-24 bg-[#dde5b6] rounded-lg"></div>
          <div className="h-6 w-16 bg-[#dde5b6] rounded-lg"></div>
        </div>
        
        <hr className="border-[#dde5b6] my-6" />
        
        <div className="space-y-3 mb-8">
          <div className="h-4 w-full bg-[#dde5b6] rounded-lg"></div>
          <div className="h-4 w-full bg-[#dde5b6] rounded-lg"></div>
          <div className="h-4 w-3/4 bg-[#dde5b6] rounded-lg"></div>
        </div>
        
        <div className="h-12 w-1/2 bg-[#dde5b6] rounded-xl"></div>
      </div>
    </div>
  );
};
